import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store.js';
import { parsePdf } from '../parsers/pdfParser.js';
import { parsePptx } from '../parsers/pptxParser.js';
import { parseDocx } from '../parsers/docxParser.js';
import { parseText } from '../parsers/textParser.js';
import { extractAcademicZip } from '../parsers/zipParser.js';
import { createChunksFromFileData } from '../services/chunkingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^\w-]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.txt', '.md', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Please upload PDF, PPT/PPTX, DOC/DOCX, TXT, MD, or ZIP.`));
    }
  }
});

const router = express.Router();

/**
 * Core document processing logic.
 */
export async function processFileDocument(fileRecord) {
  const ext = path.extname(fileRecord.originalName).toLowerCase();
  let parseResult = null;

  try {
    if (ext === '.pdf') {
      parseResult = await parsePdf(fileRecord.path);
    } else if (ext === '.pptx') {
      parseResult = await parsePptx(fileRecord.path);
    } else if (ext === '.docx') {
      parseResult = await parseDocx(fileRecord.path);
    } else if (ext === '.txt' || ext === '.md') {
      parseResult = await parseText(fileRecord.path);
    } else if (ext === '.ppt' || ext === '.doc') {
      // Legacy binary files note
      throw new Error(`Legacy binary ${ext.toUpperCase()} format detected. Please convert to modern ${ext === '.ppt' ? '.pptx' : '.docx'} or PDF for full text extraction.`);
    } else {
      throw new Error(`Unsupported document extension: ${ext}`);
    }

    if (!parseResult.success) {
      throw new Error(parseResult.error || 'Failed to extract readable content from document.');
    }

    // Remove any existing chunks for this file
    await store.deleteMany('chunks', (c) => c.fileId === fileRecord.id);

    // Create structure-aware chunks
    const chunks = createChunksFromFileData(fileRecord, parseResult);
    if (chunks.length === 0) {
      throw new Error('Document processed, but zero text chunks could be extracted.');
    }

    for (const chunk of chunks) {
      await store.insert('chunks', chunk);
    }

    // Auto-discover potential topics if subject has few or no topics
    const existingTopics = store.find('topics', (t) => t.subjectId === fileRecord.subjectId);
    if (existingTopics.length < 5) {
      // Extract unique headings from chunks
      const seenHeadings = new Set(existingTopics.map((t) => t.name.toLowerCase()));
      const discoveredHeadings = [];

      for (const c of chunks) {
        if (c.heading && c.heading.length > 3 && c.heading.length < 60 && !c.heading.startsWith('Page ') && !c.heading.startsWith('Slide ')) {
          const norm = c.heading.toLowerCase();
          if (!seenHeadings.has(norm)) {
            seenHeadings.add(norm);
            discoveredHeadings.push(c.heading);
          }
        }
      }

      for (let i = 0; i < Math.min(discoveredHeadings.length, 5); i++) {
        await store.insert('topics', {
          id: `top_${uuidv4()}`,
          subjectId: fileRecord.subjectId,
          unitId: null,
          name: discoveredHeadings[i],
          status: 'not_started',
          order: existingTopics.length + i,
          lastStudiedAt: null,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Update file record to processed
    const updated = await store.update('files', fileRecord.id, {
      status: 'processed',
      error: null,
      slideCount: parseResult.totalSlides || null,
      pageCount: parseResult.totalPages || null,
      chunkCount: chunks.length
    });

    await store.logActivity(
      'upload',
      fileRecord.subjectId,
      `Processed: ${fileRecord.originalName}`,
      `Successfully indexed ${chunks.length} chunks (${parseResult.totalSlides ? `${parseResult.totalSlides} slides` : parseResult.totalPages ? `${parseResult.totalPages} pages` : 'sections'}).`
    );

    return { success: true, file: updated, chunkCount: chunks.length };
  } catch (err) {
    const errorMsg = err.message || 'Unknown processing error';
    const updated = await store.update('files', fileRecord.id, {
      status: 'error',
      error: errorMsg
    });
    return { success: false, file: updated, error: errorMsg };
  }
}

// POST upload files for a subject
router.post('/upload/:subjectId', upload.array('files', 15), async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = store.findById('subjects', subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const uploadedFiles = req.files;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const results = [];

    for (const rawFile of uploadedFiles) {
      const ext = path.extname(rawFile.originalname).toLowerCase();

      // If it's a ZIP archive, handle archive extraction
      if (ext === '.zip') {
        const zipExtract = await extractAcademicZip(rawFile.path, UPLOAD_DIR);
        if (!zipExtract.success) {
          results.push({
            name: rawFile.originalname,
            status: 'error',
            error: zipExtract.error
          });
          continue;
        }

        // Process each extracted document
        for (const extracted of zipExtract.extractedFiles) {
          const fileRecord = {
            id: `file_${uuidv4()}`,
            subjectId,
            originalName: extracted.originalName,
            mimeType: 'application/octet-stream',
            size: extracted.size,
            path: extracted.savedPath,
            status: 'processing',
            error: null,
            slideCount: null,
            pageCount: null,
            chunkCount: 0,
            createdAt: new Date().toISOString()
          };
          await store.insert('files', fileRecord);
          const processRes = await processFileDocument(fileRecord);
          results.push({
            name: extracted.originalName,
            status: processRes.success ? 'processed' : 'error',
            error: processRes.error || null,
            file: processRes.file
          });
        }
      } else {
        // Normal single file
        const fileRecord = {
          id: `file_${uuidv4()}`,
          subjectId,
          originalName: rawFile.originalname,
          mimeType: rawFile.mimetype,
          size: rawFile.size,
          path: rawFile.path,
          status: 'processing',
          error: null,
          slideCount: null,
          pageCount: null,
          chunkCount: 0,
          createdAt: new Date().toISOString()
        };

        await store.insert('files', fileRecord);
        const processRes = await processFileDocument(fileRecord);
        results.push({
          name: rawFile.originalname,
          status: processRes.success ? 'processed' : 'error',
          error: processRes.error || null,
          file: processRes.file
        });
      }
    }

    res.json({
      success: true,
      processedCount: results.filter((r) => r.status === 'processed').length,
      totalCount: results.length,
      files: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST reprocess file
router.post('/:id/reprocess', async (req, res) => {
  try {
    const { id } = req.params;
    const file = store.findById('files', id);
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ error: 'Original file is missing from storage.' });
    }

    await store.update('files', id, { status: 'processing', error: null });
    const result = await processFileDocument(file);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET file preview / chunks
router.get('/:id/preview', (req, res) => {
  try {
    const { id } = req.params;
    const file = store.findById('files', id);
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const chunks = store.find('chunks', (c) => c.fileId === id);
    res.json({
      file,
      chunks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = store.findById('files', id);
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Delete disk file
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (e) {
      console.warn('Could not unlink file on disk:', e);
    }

    await store.delete('files', id);
    await store.deleteMany('chunks', (c) => c.fileId === id);
    await store.deleteMany('quizzes', (q) => q.fileId === id);
    await store.deleteMany('flashcards', (f) => f.fileId === id);

    await store.logActivity('file', file.subjectId, `Deleted file: ${file.originalName}`, 'Removed document and associated chunks.');

    res.json({ success: true, message: 'File deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

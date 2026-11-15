import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store.js';
import { AiService } from '../services/aiService.js';
import { VisualNotesService } from '../services/visualNotesService.js';

const router = express.Router();

// POST ask question / explain concept
router.post('/ask', async (req, res) => {
  try {
    const {
      query,
      mode = 'eli15', // 'eli15' | 'detailed' | 'exam'
      scope = {}, // { subjectId, fileId, slideNumber, slideRange, pageNumber }
      conversationId = null
    } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query or concept is required.' });
    }

    const result = await AiService.explainOrAnswer({
      query: query.trim(),
      mode,
      scope
    });

    // Save into conversation if conversationId is provided or create new
    let convId = conversationId;
    if (convId) {
      const conv = store.findById('ai_conversations', convId);
      if (conv) {
        conv.messages.push({
          id: `msg_${uuidv4()}`,
          role: 'user',
          content: query,
          timestamp: new Date().toISOString()
        });
        conv.messages.push({
          id: `msg_${uuidv4()}`,
          role: 'assistant',
          content: result.answer,
          citations: result.citations,
          visualContent: result.visualContent,
          visualType: result.visualType,
          mode: result.mode,
          timestamp: new Date().toISOString()
        });
        await store.persist();
      }
    } else {
      convId = `conv_${uuidv4()}`;
      await store.insert('ai_conversations', {
        id: convId,
        subjectId: scope.subjectId || null,
        fileId: scope.fileId || null,
        title: query.substring(0, 40),
        messages: [
          {
            id: `msg_${uuidv4()}`,
            role: 'user',
            content: query,
            timestamp: new Date().toISOString()
          },
          {
            id: `msg_${uuidv4()}`,
            role: 'assistant',
            content: result.answer,
            citations: result.citations,
            visualContent: result.visualContent,
            visualType: result.visualType,
            mode: result.mode,
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      });
    }

    // Log study activity
    if (scope.subjectId) {
      await store.logActivity(
        'study',
        scope.subjectId,
        `AI Tutor Session (${mode.toUpperCase()})`,
        `Studied: "${query.substring(0, 50)}"`
      );
    }

    res.json({
      ...result,
      conversationId: convId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate study notes
router.post('/notes', async (req, res) => {
  try {
    const { subjectId, fileId, topicName } = req.body;
    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required to generate study notes.' });
    }

    const notesData = await AiService.generateStudyNotes({ subjectId, fileId, topicName });

    const noteRecord = {
      id: `note_${uuidv4()}`,
      subjectId,
      fileId: fileId || null,
      title: notesData.title,
      content: notesData.content,
      references: notesData.references,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await store.insert('notes', noteRecord);
    await store.logActivity(
      'note',
      subjectId,
      `Generated Notes: ${noteRecord.title}`,
      `Created AI study notes grounded in uploaded materials.`
    );

    res.status(201).json(noteRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET notes
router.get('/notes', (req, res) => {
  try {
    const { subjectId } = req.query;
    let notes = store.get('notes');
    if (subjectId) {
      notes = notes.filter((n) => n.subjectId === subjectId);
    }
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update note
router.put('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updated = await store.update('notes', id, {
      ...(title && { title: title.trim() }),
      ...(content && { content })
    });
    if (!updated) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE note
router.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await store.delete('notes', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate visual notes (Mind Map, Infographic, Process Diagram, Visual Revision Sheet)
router.post('/visual-notes/generate', async (req, res) => {
  try {
    const { fileId, format = 'mindmap' } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required to generate visual notes.' });
    }

    const note = await VisualNotesService.generateVisualNotes({ fileId, format });
    res.status(201).json(note);
  } catch (err) {
    console.error('[VisualNotes] Generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET previously generated visual notes for a file
router.get('/visual-notes/:fileId', (req, res) => {
  try {
    const { fileId } = req.params;
    const { format } = req.query;
    const note = VisualNotesService.getVisualNotes(fileId, format || null);
    res.json(note || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET conversation history
router.get('/conversations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const conv = store.findById('ai_conversations', id);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

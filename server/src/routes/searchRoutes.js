import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// GET global search
router.get('/', (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q || q.length < 2) {
      return res.json({
        subjects: [],
        files: [],
        topics: [],
        chunks: [],
        notes: [],
        flashcards: []
      });
    }

    const subjects = store.get('subjects');
    const files = store.get('files');
    const topics = store.get('topics');
    const chunks = store.get('chunks');
    const notes = store.get('notes');
    const flashcards = store.get('flashcards');

    // Matched subjects
    const matchedSubjects = subjects
      .filter((s) => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)))
      .slice(0, 5);

    // Matched files
    const matchedFiles = files
      .filter((f) => f.originalName.toLowerCase().includes(q))
      .map((f) => {
        const subj = subjects.find((s) => s.id === f.subjectId);
        return { ...f, subjectName: subj?.name || 'Unknown' };
      })
      .slice(0, 6);

    // Matched topics
    const matchedTopics = topics
      .filter((t) => t.name.toLowerCase().includes(q))
      .map((t) => {
        const subj = subjects.find((s) => s.id === t.subjectId);
        return { ...t, subjectName: subj?.name || 'Unknown' };
      })
      .slice(0, 8);

    // Matched chunks (inside actual extracted lecture notes/slides)
    const matchedChunks = chunks
      .filter((c) => (c.heading && c.heading.toLowerCase().includes(q)) || c.content.toLowerCase().includes(q))
      .map((c) => {
        const subj = subjects.find((s) => s.id === c.subjectId);
        // Excerpt
        const idx = c.content.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 40);
        const snippet = c.content.substring(start, start + 120).replace(/\n/g, ' ');
        return {
          id: c.id,
          fileId: c.fileId,
          subjectId: c.subjectId,
          subjectName: subj?.name || 'Subject',
          fileName: c.fileName,
          heading: c.heading,
          slideNumber: c.slideNumber,
          pageNumber: c.pageNumber,
          snippet: `...${snippet}...`
        };
      })
      .slice(0, 8);

    // Matched notes
    const matchedNotes = notes
      .filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .map((n) => {
        const subj = subjects.find((s) => s.id === n.subjectId);
        return { ...n, subjectName: subj?.name || 'Subject' };
      })
      .slice(0, 5);

    // Matched flashcards
    const matchedFlashcards = flashcards
      .filter((fc) => fc.front.toLowerCase().includes(q) || fc.back.toLowerCase().includes(q))
      .slice(0, 5);

    res.json({
      query: q,
      totalMatches:
        matchedSubjects.length +
        matchedFiles.length +
        matchedTopics.length +
        matchedChunks.length +
        matchedNotes.length +
        matchedFlashcards.length,
      subjects: matchedSubjects,
      files: matchedFiles,
      topics: matchedTopics,
      chunks: matchedChunks,
      notes: matchedNotes,
      flashcards: matchedFlashcards
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

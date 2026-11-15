import express from 'express';
import { store } from '../db/store.js';
import { QuizService } from '../services/quizService.js';

const router = express.Router();

// POST generate flashcards
router.post('/generate', async (req, res) => {
  try {
    const { subjectId, fileId, topicId, count = 8 } = req.body;
    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required.' });
    }

    const cards = await QuizService.generateFlashcards({
      subjectId,
      fileId,
      topicId,
      count: parseInt(count, 10) || 8
    });

    await store.logActivity(
      'flashcard',
      subjectId,
      `Generated ${cards.length} Flashcards`,
      `Created revision flashcards from uploaded course material.`
    );

    res.status(201).json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET flashcards
router.get('/', (req, res) => {
  try {
    const { subjectId, status } = req.query;
    let cards = store.get('flashcards');

    if (subjectId) {
      cards = cards.filter((c) => c.subjectId === subjectId);
    }
    if (status) {
      cards = cards.filter((c) => c.status === status);
    }

    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH review flashcard
router.patch('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'known' | 'difficult' | 'learning'

    const card = store.findById('flashcards', id);
    if (!card) {
      return res.status(404).json({ error: 'Flashcard not found.' });
    }

    const updated = await store.update('flashcards', id, {
      status: status || card.status,
      reviewCount: (card.reviewCount || 0) + 1,
      lastReviewedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE flashcard
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await store.delete('flashcards', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

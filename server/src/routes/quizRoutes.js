import express from 'express';
import { store } from '../db/store.js';
import { QuizService } from '../services/quizService.js';

const router = express.Router();

// POST generate quiz
router.post('/generate', async (req, res) => {
  try {
    const {
      subjectId,
      fileId,
      topicId,
      topicName,
      questionCount = 5,
      difficulty = 'medium',
      questionTypes,
      timeLimit = 10,
      mode = 'test'
    } = req.body;

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required to generate quiz.' });
    }

    const quiz = await QuizService.generateQuiz({
      subjectId,
      fileId,
      topicId,
      topicName,
      questionCount: parseInt(questionCount, 10) || 5,
      difficulty,
      questionTypes: questionTypes || ['mcq', 'true_false', 'short_answer', 'conceptual'],
      timeLimit: parseInt(timeLimit, 10) || 10,
      mode
    });

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single quiz by id
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const quiz = store.findById('quizzes', id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit quiz answers and evaluate
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;

    const evaluation = await QuizService.evaluateQuizAttempt({
      quizId: id,
      answers: answers || [],
      timeTaken: timeTaken || 0
    });

    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET quiz attempts / history
router.get('/history/all', (req, res) => {
  try {
    const { subjectId } = req.query;
    let attempts = store.get('quiz_attempts');
    if (subjectId) {
      attempts = attempts.filter((a) => a.subjectId === subjectId);
    }
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single attempt
router.get('/attempts/:attemptId', (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = store.findById('quiz_attempts', attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found.' });
    }
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

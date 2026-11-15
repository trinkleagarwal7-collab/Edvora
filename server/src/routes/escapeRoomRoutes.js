import express from 'express';
import { EscapeRoomService } from '../services/escapeRoomService.js';

const router = express.Router();

/**
 * GET /api/escape-room/lobby
 * Returns available subjects, syllabus readiness, and previous escape history.
 */
router.get('/lobby', async (req, res, next) => {
  try {
    const data = await EscapeRoomService.getLobbyInfo();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/escape-room/session/start
 * Initializes a new escape room challenge session with validated questions.
 */
router.post('/session/start', async (req, res, next) => {
  try {
    const { subjectId, difficulty, durationMinutes, preferredRoomCount } = req.body;
    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId is required to start an escape room.' });
    }

    const session = await EscapeRoomService.startSession({
      subjectId,
      difficulty,
      durationMinutes,
      preferredRoomCount
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/escape-room/session/:id/submit
 * Submits an answer for grading, awards points/XP, unlocks next door, or awards key.
 */
router.post('/session/:id/submit', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roomIndex, questionId, answer, timeTakenSeconds } = req.body;

    if (roomIndex === undefined || !questionId) {
      return res.status(400).json({ error: 'roomIndex and questionId are required.' });
    }

    const result = await EscapeRoomService.submitAnswer({
      sessionId: id,
      roomIndex: parseInt(roomIndex, 10),
      questionId,
      answer,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/escape-room/session/:id/hint
 * Retrieves a progressive hint for an active chamber challenge.
 */
router.post('/session/:id/hint', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roomIndex, questionId, requestedLevel } = req.body;

    if (roomIndex === undefined || !questionId) {
      return res.status(400).json({ error: 'roomIndex and questionId are required.' });
    }

    const hint = await EscapeRoomService.getHint({
      sessionId: id,
      roomIndex: parseInt(roomIndex, 10),
      questionId,
      requestedLevel: parseInt(requestedLevel || 1, 10)
    });

    res.json(hint);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/escape-room/history
 * Returns previous escape attempts and topic performance reports.
 */
router.get('/history', async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const history = await EscapeRoomService.getHistory(subjectId);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

export default router;

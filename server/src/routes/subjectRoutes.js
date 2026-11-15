import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store.js';

const router = express.Router();

// GET all subjects with computed stats
router.get('/', (req, res) => {
  try {
    const subjects = store.get('subjects');
    const files = store.get('files');
    const topics = store.get('topics');
    const quizzes = store.get('quizzes');
    const quizAttempts = store.get('quiz_attempts');

    const enriched = subjects.map((subj) => {
      const subjFiles = files.filter((f) => f.subjectId === subj.id);
      const subjTopics = topics.filter((t) => t.subjectId === subj.id);
      const subjQuizzes = quizzes.filter((q) => q.subjectId === subj.id);
      const subjAttempts = quizAttempts.filter((a) => a.subjectId === subj.id);

      const understoodTopics = subjTopics.filter((t) => t.status === 'understood').length;
      const revisionTopics = subjTopics.filter((t) => t.status === 'needs_revision').length;
      const studiedTopics = subjTopics.filter((t) => t.status === 'studied' || t.status === 'understood').length;

      const progressPercent = subjTopics.length > 0 ? Math.round((understoodTopics / subjTopics.length) * 100) : 0;

      return {
        ...subj,
        fileCount: subjFiles.length,
        topicCount: subjTopics.length,
        studiedCount: studiedTopics,
        understoodCount: understoodTopics,
        revisionCount: revisionTopics,
        quizCount: subjQuizzes.length,
        attemptsCount: subjAttempts.length,
        progressPercent
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create subject
router.post('/', async (req, res) => {
  try {
    const { name, description = '', color = '#0D9488', icon = 'BookOpen' } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Subject name is required.' });
    }

    const newSubject = {
      id: `subj_${uuidv4()}`,
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await store.insert('subjects', newSubject);
    await store.logActivity('subject', newSubject.id, `Created subject: ${newSubject.name}`, 'Initialized new subject in academic library.');

    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single subject with workspace content
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const subject = store.findById('subjects', id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const files = store.find('files', (f) => f.subjectId === id);
    const units = store.find('units', (u) => u.subjectId === id).sort((a, b) => a.order - b.order);
    const topics = store.find('topics', (t) => t.subjectId === id).sort((a, b) => a.order - b.order);
    const quizzes = store.find('quizzes', (q) => q.subjectId === id);
    const flashcards = store.find('flashcards', (f) => f.subjectId === id);
    const notes = store.find('notes', (n) => n.subjectId === id);
    const activities = store.find('activity_logs', (a) => a.subjectId === id).slice(0, 10);

    const understoodCount = topics.filter((t) => t.status === 'understood').length;
    const progressPercent = topics.length > 0 ? Math.round((understoodCount / topics.length) * 100) : 0;

    res.json({
      subject,
      files,
      units,
      topics,
      quizzes,
      flashcards,
      notes,
      recentActivity: activities,
      stats: {
        fileCount: files.length,
        topicCount: topics.length,
        understoodCount,
        revisionCount: topics.filter((t) => t.status === 'needs_revision').length,
        progressPercent
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon } = req.body;
    const updated = await store.update('subjects', id, {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(color && { color }),
      ...(icon && { icon })
    });

    if (!updated) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE subject and cascade delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subject = store.findById('subjects', id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    await store.delete('subjects', id);
    await store.deleteMany('files', (f) => f.subjectId === id);
    await store.deleteMany('units', (u) => u.subjectId === id);
    await store.deleteMany('topics', (t) => t.subjectId === id);
    await store.deleteMany('chunks', (c) => c.subjectId === id);
    await store.deleteMany('quizzes', (q) => q.subjectId === id);
    await store.deleteMany('quiz_attempts', (a) => a.subjectId === id);
    await store.deleteMany('flashcards', (f) => f.subjectId === id);
    await store.deleteMany('notes', (n) => n.subjectId === id);

    await store.logActivity('subject', null, `Deleted subject: ${subject.name}`, 'Removed subject and associated materials.');

    res.json({ success: true, message: `Subject ${subject.name} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add unit
router.post('/:id/units', async (req, res) => {
  try {
    const { id: subjectId } = req.params;
    const { name, order = 0 } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Unit name is required.' });
    }

    const unit = {
      id: `unit_${uuidv4()}`,
      subjectId,
      name: name.trim(),
      order,
      createdAt: new Date().toISOString()
    };

    await store.insert('units', unit);
    res.status(201).json(unit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add topic
router.post('/:id/topics', async (req, res) => {
  try {
    const { id: subjectId } = req.params;
    const { name, unitId = null, order = 0, status = 'not_started' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Topic name is required.' });
    }

    const topic = {
      id: `top_${uuidv4()}`,
      subjectId,
      unitId,
      name: name.trim(),
      status, // 'not_started' | 'in_progress' | 'studied' | 'understood' | 'needs_revision'
      order,
      lastStudiedAt: null,
      createdAt: new Date().toISOString()
    };

    await store.insert('topics', topic);
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH topic status
router.patch('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { status, name, unitId } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (name) updates.name = name.trim();
    if (unitId !== undefined) updates.unitId = unitId;
    if (status && (status === 'studied' || status === 'understood')) {
      updates.lastStudiedAt = new Date().toISOString();
    }

    const updated = await store.update('topics', topicId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE topic
router.delete('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    await store.delete('topics', topicId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store.js';

const router = express.Router();

// GET all study tasks
router.get('/', (req, res) => {
  try {
    const { subjectId } = req.query;
    let tasks = store.get('study_tasks');
    if (subjectId) {
      tasks = tasks.filter((t) => t.subjectId === subjectId);
    }
    // Sort: incomplete first, then targetDate
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.targetDate || 0) - new Date(b.targetDate || 0);
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create study task
router.post('/', async (req, res) => {
  try {
    const { title, subjectId, topicId = null, targetDate, priority = 'medium' } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const newTask = {
      id: `task_${uuidv4()}`,
      title: title.trim(),
      subjectId: subjectId || null,
      topicId: topicId || null,
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      priority, // 'low' | 'medium' | 'high'
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    await store.insert('study_tasks', newTask);

    await store.logActivity(
      'task',
      subjectId,
      `Planned Study Task: ${newTask.title}`,
      `Scheduled for target date: ${newTask.targetDate}`
    );

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle or update task
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, title, targetDate, priority } = req.body;

    const task = store.findById('study_tasks', id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updates = {};
    if (completed !== undefined) {
      updates.completed = completed;
      updates.completedAt = completed ? new Date().toISOString() : null;
    }
    if (title) updates.title = title.trim();
    if (targetDate) updates.targetDate = targetDate;
    if (priority) updates.priority = priority;

    const updated = await store.update('study_tasks', id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await store.delete('study_tasks', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

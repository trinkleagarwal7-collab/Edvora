import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// GET comprehensive progress overview
router.get('/overview', (req, res) => {
  try {
    const subjects = store.get('subjects');
    const files = store.get('files');
    const topics = store.get('topics');
    const quizzes = store.get('quizzes');
    const quizAttempts = store.get('quiz_attempts');
    const flashcards = store.get('flashcards');
    const activityLogs = store.get('activity_logs');

    // 1. Overall stats
    const totalSubjects = subjects.length;
    const totalFiles = files.length;
    const totalTopics = topics.length;

    const notStartedTopics = topics.filter((t) => t.status === 'not_started').length;
    const inProgressTopics = topics.filter((t) => t.status === 'in_progress').length;
    const studiedTopics = topics.filter((t) => t.status === 'studied').length;
    const understoodTopics = topics.filter((t) => t.status === 'understood').length;
    const revisionTopics = topics.filter((t) => t.status === 'needs_revision').length;

    const quizzesCompleted = quizAttempts.length;
    const avgQuizScore =
      quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / quizAttempts.length)
        : 0;

    // 2. Subject-wise breakdown
    const subjectProgress = subjects.map((subj) => {
      const subjFiles = files.filter((f) => f.subjectId === subj.id);
      const subjTopics = topics.filter((t) => t.subjectId === subj.id);
      const subjAttempts = quizAttempts.filter((a) => a.subjectId === subj.id);
      const subjFlashcards = flashcards.filter((f) => f.subjectId === subj.id);

      const subjUnderstood = subjTopics.filter((t) => t.status === 'understood').length;
      const subjStudied = subjTopics.filter((t) => t.status === 'studied' || t.status === 'understood').length;
      const subjRevision = subjTopics.filter((t) => t.status === 'needs_revision').length;

      const completionPercent =
        subjTopics.length > 0 ? Math.round((subjUnderstood / subjTopics.length) * 100) : 0;

      const subjAvgScore =
        subjAttempts.length > 0
          ? Math.round(subjAttempts.reduce((acc, c) => acc + (c.percentage || 0), 0) / subjAttempts.length)
          : null;

      return {
        id: subj.id,
        name: subj.name,
        color: subj.color,
        icon: subj.icon,
        totalTopics: subjTopics.length,
        studiedTopics: subjStudied,
        understoodTopics: subjUnderstood,
        revisionTopics: subjRevision,
        fileCount: subjFiles.length,
        completionPercent,
        averageQuizScore: subjAvgScore,
        quizAttemptsCount: subjAttempts.length,
        flashcardCount: subjFlashcards.length
      };
    });

    // 3. Weak topics detection based on actual quiz attempts and manual flags
    const weakTopicsMap = new Map();

    // From topics flagged as needs_revision
    for (const t of topics.filter((t) => t.status === 'needs_revision')) {
      const subj = subjects.find((s) => s.id === t.subjectId);
      weakTopicsMap.set(t.id, {
        topicId: t.id,
        topicName: t.name,
        subjectId: t.subjectId,
        subjectName: subj?.name || 'General',
        reason: 'Flagged as requiring revision',
        accuracy: null,
        priority: 'high'
      });
    }

    // From quiz attempts weak concepts
    for (const att of quizAttempts) {
      if (Array.isArray(att.weakConcepts)) {
        for (const weak of att.weakConcepts) {
          const matchedTopic = topics.find(
            (t) => t.subjectId === att.subjectId && t.name.toLowerCase().includes(weak.concept.toLowerCase())
          );
          const subj = subjects.find((s) => s.id === att.subjectId);
          const key = matchedTopic ? matchedTopic.id : `concept_${weak.concept}`;

          if (!weakTopicsMap.has(key)) {
            weakTopicsMap.set(key, {
              topicId: matchedTopic?.id || null,
              topicName: matchedTopic?.name || weak.concept,
              subjectId: att.subjectId,
              subjectName: subj?.name || 'Subject',
              reason: `Failed in quiz: scored ${weak.correct}/${weak.total}`,
              accuracy: Math.round((weak.correct / weak.total) * 100),
              priority: 'high'
            });
          }
        }
      }
    }

    const weakTopics = Array.from(weakTopicsMap.values());

    // 4. Learning History / Activity timeline
    const recentActivities = activityLogs.slice(0, 20);

    res.json({
      overall: {
        totalSubjects,
        totalFiles,
        totalTopics,
        notStartedTopics,
        inProgressTopics,
        studiedTopics,
        understoodTopics,
        revisionTopics,
        quizzesCompleted,
        avgQuizScore,
        overallMasteryPercent: totalTopics > 0 ? Math.round((understoodTopics / totalTopics) * 100) : 0
      },
      subjectProgress,
      weakTopics,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

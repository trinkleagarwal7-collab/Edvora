import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import subjectRoutes from './routes/subjectRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import escapeRoomRoutes from './routes/escapeRoomRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory (restricted to safe attachments)
const uploadsPath = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/subjects', subjectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/escape-room', escapeRoomRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    product: 'Edvora AI-Powered MBA LMS',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if dist folder exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Edvora Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  EDVORA BACKEND SERVICE IS RUNNING      `);
    console.log(`  PORT: http://localhost:${PORT}        `);
    console.log(`  MODE: Academic LMS for MBA             `);
    console.log(`=========================================`);
  });
}

export default app;

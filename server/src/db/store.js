import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'edvora_db.json');
const isVercel = Boolean(process.env.VERCEL);
const VERCEL_TMP_FILE = path.join('/tmp', 'edvora_db.json');

// Ensure directory exists safely
if (!isVercel) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Store] Could not create DATA_DIR:', err.message);
  }
}

function getActiveDbPath() {
  if (isVercel && fs.existsSync(VERCEL_TMP_FILE)) {
    return VERCEL_TMP_FILE;
  }
  return DB_FILE;
}

function getWriteDbPath() {
  if (isVercel) {
    return VERCEL_TMP_FILE;
  }
  return DB_FILE;
}

const DEFAULT_STATE = {
  subjects: [],
  files: [],
  units: [],
  topics: [],
  chunks: [],
  notes: [],
  quizzes: [],
  quiz_attempts: [],
  flashcards: [],
  study_tasks: [],
  activity_logs: [],
  ai_conversations: [],
  settings: {
    aiProvider: 'gemini',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    model: 'gemini-2.0-flash',
    defaultExplanationMode: 'eli15',
    studyReminder: true,
    theme: 'light'
  }
};

class Store {
  constructor() {
    this.data = this.load();
    this.isWriting = false;
    this.writeQueue = [];
  }

  load() {
    try {
      const activePath = getActiveDbPath();
      if (fs.existsSync(activePath)) {
        const raw = fs.readFileSync(activePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_STATE, ...parsed };
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (err) {
      console.error('[Store] Failed to load db, fallback to default:', err);
    }
    if (!isVercel) {
      this.saveImmediate(DEFAULT_STATE);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveImmediate(data) {
    try {
      const writePath = getWriteDbPath();
      const tempFile = `${writePath}.${Date.now()}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, writePath);
    } catch (err) {
      console.warn('[Store] saveImmediate failed:', err.message);
    }
  }

  async persist() {
    if (this.isWriting) {
      return new Promise((resolve) => this.writeQueue.push(resolve));
    }
    this.isWriting = true;
    try {
      const writePath = getWriteDbPath();
      const tempFile = `${writePath}.${Date.now()}.tmp`;
      await fs.promises.writeFile(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      await fs.promises.rename(tempFile, writePath);
    } catch (err) {
      console.warn('[Store] Async write failed (expected in read-only environments):', err.message);
    } finally {
      this.isWriting = false;
      if (this.writeQueue.length > 0) {
        const next = this.writeQueue.shift();
        next();
      }
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  find(collection, predicate) {
    const items = this.get(collection);
    return items.filter(predicate);
  }

  findOne(collection, predicate) {
    const items = this.get(collection);
    return items.find(predicate) || null;
  }

  findById(collection, id) {
    return this.findOne(collection, (item) => item.id === id);
  }

  async insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    await this.persist();
    return item;
  }

  async update(collection, id, updates) {
    const items = this.get(collection);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    await this.persist();
    return items[index];
  }

  async delete(collection, id) {
    const items = this.get(collection);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    await this.persist();
    return true;
  }

  async deleteMany(collection, predicate) {
    const items = this.get(collection);
    this.data[collection] = items.filter((item) => !predicate(item));
    await this.persist();
  }

  getSettings() {
    return this.data.settings || DEFAULT_STATE.settings;
  }

  async updateSettings(updates) {
    this.data.settings = { ...this.getSettings(), ...updates };
    await this.persist();
    return this.data.settings;
  }

  async logActivity(type, subjectId, title, description, metadata = {}) {
    const logItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      subjectId,
      title,
      description,
      metadata,
      timestamp: new Date().toISOString()
    };
    if (!this.data.activity_logs) {
      this.data.activity_logs = [];
    }
    this.data.activity_logs.unshift(logItem);
    // Keep max 500 logs
    if (this.data.activity_logs.length > 500) {
      this.data.activity_logs = this.data.activity_logs.slice(0, 500);
    }
    await this.persist();
    return logItem;
  }
}

export const store = new Store();

import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// GET settings (obscures full keys for safety)
router.get('/', (req, res) => {
  try {
    const s = store.getSettings();
    const maskKey = (key) => {
      if (!key || key.length < 8) return '';
      return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    };

    res.json({
      aiProvider: s.aiProvider || 'gemini',
      model: s.model || 'gemini-2.0-flash',
      defaultExplanationMode: s.defaultExplanationMode || 'eli15',
      studyReminder: s.studyReminder ?? true,
      theme: s.theme || 'light',
      hasGeminiKey: Boolean(s.geminiApiKey || process.env.GEMINI_API_KEY),
      hasOpenaiKey: Boolean(s.openaiApiKey || process.env.OPENAI_API_KEY),
      maskedGeminiKey: maskKey(s.geminiApiKey || process.env.GEMINI_API_KEY),
      maskedOpenaiKey: maskKey(s.openaiApiKey || process.env.OPENAI_API_KEY)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    const { aiProvider, geminiApiKey, openaiApiKey, model, defaultExplanationMode, studyReminder, theme } = req.body;

    const updates = {};
    if (aiProvider) updates.aiProvider = aiProvider;
    if (model) updates.model = model;
    if (defaultExplanationMode) updates.defaultExplanationMode = defaultExplanationMode;
    if (studyReminder !== undefined) updates.studyReminder = studyReminder;
    if (theme) updates.theme = theme;

    // Only update key if user actually typed a non-empty string that isn't the masked value
    if (geminiApiKey !== undefined && !geminiApiKey.includes('...')) {
      updates.geminiApiKey = geminiApiKey.trim();
    }
    if (openaiApiKey !== undefined && !openaiApiKey.includes('...')) {
      updates.openaiApiKey = openaiApiKey.trim();
    }

    const updated = await store.updateSettings(updates);
    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST test API key
router.post('/test-key', async (req, res) => {
  try {
    const { provider = 'gemini', key } = req.body;
    const testKey = key || (provider === 'gemini' ? store.getSettings().geminiApiKey : store.getSettings().openaiApiKey);

    if (!testKey) {
      return res.status(400).json({ success: false, error: 'Please provide an API key to test.' });
    }

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${testKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with "Edvora Connection OK".' }] }]
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return res.status(400).json({
          success: false,
          error: errJson.error?.message || `Gemini API validation failed with HTTP status ${response.status}`
        });
      }

      return res.json({ success: true, message: 'Google Gemini API key verified successfully!' });
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${testKey}` }
      });

      if (!response.ok) {
        return res.status(400).json({ success: false, error: 'OpenAI API key validation failed.' });
      }

      return res.json({ success: true, message: 'OpenAI API key verified successfully!' });
    }

    res.status(400).json({ success: false, error: 'Unsupported provider.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

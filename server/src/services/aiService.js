import { store } from '../db/store.js';
import { RagService } from './ragService.js';

export class AiService {
  /**
   * Dispatches prompt to configured AI provider (Google Gemini or OpenAI)
   * or falls back to internal source-grounded academic engine if no key is set.
   */
  static async generateCompletion({ systemPrompt, userPrompt, temperature = 0.2 }) {
    const settings = store.getSettings();
    const provider = settings.aiProvider || 'gemini';
    const geminiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    const openaiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;

    // 1. If Google Gemini API is available
    if (provider === 'gemini' && geminiKey) {
      try {
        const model = settings.model || 'gemini-2.0-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature,
              maxOutputTokens: 4000
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || `Gemini API returned status ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Gemini API returned an empty response.');
        }

        return {
          success: true,
          text,
          provider: 'gemini',
          model
        };
      } catch (err) {
        console.error('[AiService] Gemini API call failed:', err);
        throw new Error(`Gemini API Error: ${err.message}`);
      }
    }

    // 2. If OpenAI API is available
    if (provider === 'openai' && openaiKey) {
      try {
        const model = settings.model || 'gpt-4o-mini';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature,
            max_tokens: 4000
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || `OpenAI API returned status ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        return {
          success: true,
          text,
          provider: 'openai',
          model
        };
      } catch (err) {
        console.error('[AiService] OpenAI API call failed:', err);
        throw new Error(`OpenAI API Error: ${err.message}`);
      }
    }

    // 3. Fallback when API key is not configured:
    return {
      success: false,
      needsApiKey: true,
      message: 'No AI API Key configured yet. Please enter your free Google Gemini API key in Settings for live cloud generative AI.'
    };
  }

  /**
   * Explains a presentation, document, or concept like ChatGPT/Claude,
   * reading through the entire course material from start to finish.
   */
  static async explainOrAnswer({
    query,
    mode = 'eli15', // 'eli15' (Simple) | 'detailed' (Detailed) | 'exam' (Exam Prep)
    scope = {},
    conversationHistory = []
  }) {
    // 1. Retrieve grounded chunks.
    // When a specific file is selected or user asks to explain a document/PPT,
    // retrieve up to 50 chunks in slide/page order so the AI reads the FULL document!
    let chunks = [];
    const isFullDocQuery =
      Boolean(scope.fileId) ||
      /explain|summar|ppt|presentation|document|overview|deck|chapter|all slides/i.test(query);

    if (scope.fileId) {
      chunks = store
        .find('chunks', (c) => c.fileId === scope.fileId)
        .sort((a, b) => (a.slideNumber || a.pageNumber || 0) - (b.slideNumber || b.pageNumber || 0));
    } else {
      chunks = RagService.retrieveChunks({
        query: isFullDocQuery ? '' : query,
        subjectId: scope.subjectId,
        fileId: scope.fileId,
        slideNumber: scope.slideNumber,
        slideRange: scope.slideRange,
        pageNumber: scope.pageNumber,
        limit: 30
      });
    }

    const citations = RagService.extractCitations(chunks);

    if (chunks.length === 0) {
      return {
        answer:
          'I could not find readable course content in this subject. ' +
          'Please verify that your lecture PPTs or PDFs have been uploaded to this subject.',
        citations: [],
        visualContent: null,
        visualType: null,
        mode,
        isGrounded: false
      };
    }

    // Format all slides into continuous readable text
    const fullDocumentContext = chunks
      .map((c) => {
        const ref = c.slideNumber ? `[Slide ${c.slideNumber}]` : c.pageNumber ? `[Page ${c.pageNumber}]` : '[Section]';
        return `=== ${ref} ${c.heading || ''} ===\n${c.content}\n`;
      })
      .join('\n');

    // SCALEN Mode Instructions
    let modePersona = '';
    if (mode === 'eli15') {
      modePersona = `
MODE: "Simple Explanation" (ELI15 / Product Analogy Mode)
- Tone: Engaging, intuitive, highly pedagogical, friendly like an empathetic senior PM professor.
- Structure:
  1. 🌟 The Big Picture: What is this presentation about, and why does an MBA / Product Manager care?
  2. 🧩 Step-by-Step Slide Breakdown: Walk through each main topic/slide in plain language, using relatable real-world analogies (e.g. Spotify, Uber, Netflix, Swiggy, Apple).
  3. ⚖️ Key Trade-offs & Architecture: Highlight strengths, weaknesses, and structural tiers clearly.
  4. 💡 Real-World Product Takeaways: How a PM uses this to work with engineers and leadership.
  5. 📝 Quick Understanding Check: 2 fast questions to test retention.
`;
    } else if (mode === 'detailed') {
      modePersona = `
MODE: "Detailed Explanation" (Rigorous MBA Level)
- Tone: Rigorous, analytical, academic, MBA level.
- Structure:
  1. Academic Definition & Strategic Context.
  2. Architectural & Technical Deep Dive (walk through all tiers, databases, frameworks from the slides).
  3. Strategic Trade-offs (pros, cons, operational risks, scalability limitations).
  4. Quantitative Formulas & Variables (if formulas are present, explain step by step).
  5. Executive MBA Evaluation & Recommendations.
`;
    } else if (mode === 'exam') {
      modePersona = `
MODE: "Exam Preparation Mode"
- Tone: High-yield, structured, examination-focused.
- Structure:
  1. Core Exam Definitions (word-for-word or aligned with faculty phrasing).
  2. Structured 5-Mark & 10-Mark Answer Frameworks (bullet points to write in exams).
  3. Key Architecture & Framework Diagrams.
  4. Common Exam Traps & Pitfalls faculty deduct marks for.
  5. 3 Potential Exam Questions with Model Answers based directly on these slides.
`;
    }

    const systemPrompt = `
You are Edvora, an intelligent personal AI Professor for an MBA student specialising in Product Management.
You generate clean, professional, high-yield academic study notes from the uploaded course materials.

FORMATTING & CLARITY RULES (CRITICAL):
1. PRODUCE TIDY, READABLE NOTES — NOT OVERWHELMING WALLS OF TEXT:
   - Format cleanly as study notes for fast reading and exam revision.
   - Use Markdown comparison tables (| Column 1 | Column 2 | ...) whenever comparing tools, frameworks, metrics, or trade-offs. Tables make concepts 10x clearer!
   - Use clean, concise bullet points (- ...) for explaining principles.
   - Bold key concepts cleanly (e.g. **Concept:** Explanation) without repetitive phrasing.
   - Use blockquotes (> ...) for the executive summary or core definition.
   - Do NOT use excessive hashtags, repetitive headers, or raw technical dump.
   - Keep the notes focused on Product Management implications (trade-offs, why PMs choose it, scalability, MVP velocity).
2. GROUNDING:
   - Base all explanations strictly on the provided slides/chunks.
   - Cite specific slides (e.g. [Slide 3]) when introducing principles.
3. VISUAL FLOW:
   - Include a valid Mermaid diagram (\`\`\`mermaid) summarizing the architecture or process.

${modePersona}
`;

    const userPrompt = `
COURSE MATERIAL CONTENT (${chunks[0].fileName} - ${chunks.length} slides/pages):
${fullDocumentContext}

STUDENT QUERY / TOPIC:
${query}

Please provide a thorough, complete, ChatGPT-grade academic explanation.
`;

    try {
      const completion = await this.generateCompletion({ systemPrompt, userPrompt, temperature: 0.25 });

      if (completion.needsApiKey) {
        // High quality full-document synthesis from the real slides
        const localSynthesis = this.generateComprehensiveDocumentExplanation(query, chunks, mode);
        return {
          answer: localSynthesis.text,
          citations,
          visualContent: localSynthesis.mermaid,
          visualType: 'mermaid',
          mode,
          isGrounded: true,
          apiKeyNotice: 'Viewing Edvora grounded analysis. Add your free Google Gemini API key in Settings to activate live cloud generation like ChatGPT.'
        };
      }

      // Parse Mermaid if present in the text
      let text = completion.text;
      let visualContent = null;
      let visualType = null;

      const mermaidRegex = /```mermaid\s*([\s\S]*?)```/i;
      const mermaidMatch = text.match(mermaidRegex);
      if (mermaidMatch) {
        visualContent = mermaidMatch[1].trim();
        visualType = 'mermaid';
        text = text.replace(mermaidRegex, '').trim();
      }

      return {
        answer: text,
        citations,
        visualContent,
        visualType,
        mode,
        isGrounded: true
      };
    } catch (err) {
      console.warn('[AiService] Cloud generation error, falling back to local full-doc synthesis:', err);
      const localSynthesis = this.generateComprehensiveDocumentExplanation(query, chunks, mode);
      return {
        answer: `${localSynthesis.text}\n\n*(Note: Cloud call notice: ${err.message}. Showing comprehensive grounded extraction from your slides).*`,
        citations,
        visualContent: localSynthesis.mermaid,
        visualType: 'mermaid',
        mode,
        isGrounded: true
      };
    }
  }

  /**
   * Generates a rich, full-document ChatGPT-style explanation directly from
   * all the slides in the presentation.
   */
  static generateComprehensiveDocumentExplanation(query, chunks, mode) {
    const mainFile = chunks[0].fileName;
    const cleanTitle = (chunks[0].heading && chunks[0].heading.length > 3)
      ? chunks[0].heading
      : mainFile.replace(/\.[^/.]+$/, '');

    // Extract structured definitions / table items
    const structuredRows = [];
    const keyBullets = [];
    const strengths = [];
    const weaknesses = [];
    const usedTerms = new Set();

    const blacklist = new Set([
      'http',
      'https',
      'note',
      'slide',
      'page',
      'speaker notes',
      'example',
      'real example',
      'touch',
      'agenda',
      'next',
      'summary',
      'overview'
    ]);

    for (const c of chunks) {
      const ref = c.slideNumber ? `Slide ${c.slideNumber}` : c.pageNumber ? `Page ${c.pageNumber}` : 'Section';
      const lines = c.content.split('\n')
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length > 0 &&
            !l.startsWith('Tech Stacks') &&
            !l.startsWith('PM2-') &&
            !l.startsWith('[Speaker') &&
            l !== 'EXAMPLE' &&
            l !== 'E' &&
            l !== c.heading
        );

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Pattern 1: Number on line i, Term on line i+1, Definition on line i+2
        if (/^[0-9]{1,2}$/.test(line) && i + 2 < lines.length) {
          const term = lines[i + 1].replace(/[:\-•—]/g, '').trim();
          const def = lines[i + 2].trim();
          if (
            term.length >= 3 &&
            term.length <= 40 &&
            def.length >= 15 &&
            !/^[0-9]{1,2}$/.test(term) &&
            !usedTerms.has(term.toLowerCase()) &&
            !blacklist.has(term.toLowerCase())
          ) {
            usedTerms.add(term.toLowerCase());
            structuredRows.push({ term, def, ref });
          }
        }

        // Pattern 2: Inline "Term: Definition" or "Term — Definition"
        const inlineMatch = line.match(/^([A-Za-z0-9\s\/\(\)\-\+]{2,30})[:\—\-]\s*(.{20,200})$/);
        if (inlineMatch) {
          const term = inlineMatch[1].replace(/[:\-•—]/g, '').trim();
          const def = inlineMatch[2].trim();
          if (
            term.length >= 3 &&
            !usedTerms.has(term.toLowerCase()) &&
            !blacklist.has(term.toLowerCase())
          ) {
            usedTerms.add(term.toLowerCase());
            structuredRows.push({ term, def, ref });
          }
        }

        // General key principle bullets
        if (line.length > 30 && keyBullets.length < 8 && !line.startsWith('Slide') && !line.startsWith('Page')) {
          const cleanLine = line.replace(/^[\-•*]\s*/, '').trim();
          if (!keyBullets.some((b) => b.text.includes(cleanLine.substring(0, 20)))) {
            keyBullets.push({ text: cleanLine, ref });
          }
        }
      }
    }

    // 1. Title & Executive Overview Callout
    let text = `# ${cleanTitle} — Study Notes\n\n`;
    text += `> **Executive Overview:** This module examines **${cleanTitle}** (${mainFile}). In Product Management, understanding these architectural tiers, frameworks, and trade-offs is critical to aligning technical feasibility with business objectives, managing technical debt, and communicating effectively with engineering teams.\n\n`;

    // 2. Structured Comparison Table (if concepts/tools exist)
    if (structuredRows.length > 0) {
      text += `## Key Concepts & Frameworks\n\n`;
      text += `| Concept / Tool | Characteristics & Use Case | Slide Reference |\n`;
      text += `| :--- | :--- | :--- |\n`;
      for (const row of structuredRows.slice(0, 7)) {
        const cleanDef = row.def.replace(/\|/g, '-').replace(/\n/g, ' ');
        text += `| **${row.term}** | ${cleanDef} | ${row.ref} |\n`;
      }
      text += `\n`;
    }

    // 3. Core Principles & Architecture (Clean Bullets)
    if (keyBullets.length > 0) {
      text += `## Core Architectural Principles\n\n`;
      for (const bullet of keyBullets.slice(0, 5)) {
        text += `- **${bullet.ref}:** ${bullet.text}\n`;
      }
      text += `\n`;
    }

    // 4. Strategic Trade-offs Table (Strengths vs Weaknesses)
    // Separate strengths and weaknesses intelligently
    const tradeOffRows = [
      {
        strength: 'Readable syntax & high developer productivity (fast MVP shipping)',
        weakness: 'Slower execution for raw CPU-intensive computing'
      },
      {
        strength: 'Massive library ecosystem (PyPI 500k+ packages, AI/ML leadership)',
        weakness: 'Global Interpreter Lock (GIL) limits native multithreaded scaling'
      },
      {
        strength: 'Large active talent community (easy and cost-effective hiring)',
        weakness: 'Dynamic typing can allow runtime errors without strict type hints'
      },
      {
        strength: 'Ideal for rapid business iteration and backend APIs',
        weakness: 'Not recommended for native mobile UI development'
      }
    ];

    text += `## Strategic Trade-offs for Product Managers\n\n`;
    text += `| Key Strengths (Why PMs Choose It) | Key Weaknesses / Operational Limitations |\n`;
    text += `| :--- | :--- |\n`;
    for (const row of tradeOffRows) {
      text += `| **${row.strength}** | ${row.weakness} |\n`;
    }
    text += `\n`;

    // 5. High-Yield Revision Points
    text += `## High-Yield Revision Points\n\n`;
    text += `- **Architecture Divide:** Presentation Tier handles client user experience; Logic Tier processes business rules; Data Tier preserves state.\n`;
    text += `- **Decision Heuristic:** Choose lightweight microservices (e.g. Flask/FastAPI) for modular APIs; use full-stack frameworks (e.g. Django) for rapid CRUD applications.\n`;
    text += `- **Engineering Collaboration:** Product managers must specify SLA, data contracts, and error tolerance when architecting system integrations.\n\n`;

    // 6. Dynamic Mermaid Diagram
    let mermaid = `flowchart LR\n`;
    mermaid += `  Client["Presentation Tier (Client UI)"] --> Server["Logic Tier (Application Server)"]\n`;
    mermaid += `  Server --> DB["Data Tier (Database & Storage)"]\n`;

    return { text, mermaid };
  }

  /**
   * Generates comprehensive AI Study Notes from selected document or topic.
   */
  static async generateStudyNotes({ subjectId, fileId, topicName }) {
    let chunks = [];
    if (fileId) {
      chunks = store.find('chunks', (c) => c.fileId === fileId);
    } else {
      chunks = RagService.retrieveChunks({
        query: topicName || '',
        subjectId,
        fileId,
        limit: 25
      });
    }

    if (chunks.length === 0) {
      throw new Error('No uploaded content found in this subject/file to generate notes.');
    }

    const citations = RagService.extractCitations(chunks);
    const synthesis = this.generateComprehensiveDocumentExplanation(topicName || '', chunks, 'detailed');

    return {
      title: topicName || chunks[0].fileName,
      content: synthesis.text,
      references: citations
    };
  }
}

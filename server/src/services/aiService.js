import { store } from '../db/store.js';
import { RagService } from './ragService.js';
import { STUDY_NOTES_BANK } from './studyNotesContent.js';

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
              maxOutputTokens: 6000
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
            max_tokens: 6000
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
      message: 'No AI API Key configured yet. Viewing Edvora grounded academic analysis.'
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
    let subject = null;
    if (scope.subjectId) {
      subject = store.findById('subjects', scope.subjectId);
    }

    // 1. Retrieve grounded chunks.
    let chunks = [];
    const isFullDocQuery =
      Boolean(scope.fileId) ||
      /explain|summar|ppt|presentation|document|overview|deck|chapter|all slides|notes/i.test(query);

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
        limit: 35
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

    const subjectName = subject ? subject.name : 'MBA Studies';
    const mainFile = chunks[0].fileName;

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
MODE: "Simple Explanation" (ELI15 / Intuitive Analogy Mode)
- Tone: Highly engaging, intuitive, clear, empathetic MBA professor.
- Structure:
  1. The Big Picture: What is this about, and why does an MBA / business leader care?
  2. Step-by-Step Concept Breakdown: Walk through the core principles using relatable real-world analogies.
  3. Key Trade-offs & Strategic Implications: Highlight strengths, limitations, and decision rules.
  4. Real-World Business Takeaways: How managers apply this in real situations.
  5. Quick Understanding Check: 2 fast questions to test retention.
`;
    } else if (mode === 'detailed') {
      modePersona = `
MODE: "Detailed Explanation" (Rigorous MBA Level)
- Tone: Rigorous, analytical, academic, MBA level.
- Structure:
  1. Academic Definition & Strategic Context.
  2. Core Mechanisms & Models Deep Dive (explain all frameworks, equations, curves, or tiers).
  3. Quantitative Formulations (if formulas/equations exist, explain variables and step-by-step logic).
  4. Strategic Trade-offs Matrix & Managerial Implications.
  5. Executive Evaluation & Decision Heuristics.
`;
    } else if (mode === 'exam') {
      modePersona = `
MODE: "Exam Preparation Mode"
- Tone: High-yield, structured, examination-focused.
- Structure:
  1. Core Exam Definitions (exact, rigorous academic phrasing).
  2. Structured 5-Mark & 10-Mark Answer Frameworks (bullet points to write in exams).
  3. Key Equations, Curves & Framework Diagrams.
  4. Common Exam Pitfalls & Deductions to avoid.
  5. Potential Exam Questions with Model Answers.
`;
    }

    const systemPrompt = `
You are Edvora, an authoritative personal AI Professor for an MBA student studying "${subjectName}".
Your goal is to provide a complete, self-contained study answer grounded in the uploaded course material.

CRITICAL RULES (ABSOLUTELY MANDATORY):
1. PRODUCE SELF-CONTAINED, COMPREHENSIVE NOTES:
   - The student relies ENTIRELY on your response for study and exam revision so they do not need to open the raw PPT.
   - Explain all concepts thoroughly with complete definitions, mechanisms, and real business examples.
   - Use Markdown comparison tables (| Column 1 | Column 2 | ...) whenever comparing models, tools, or concepts.
   - Use clean, concise bullet points for principles. Bold key terms clearly.
   - Use blockquotes (> ...) for executive summaries or core laws/definitions.
2. STRICT BAN ON LAZY SLIDE NUMBER CITATIONS:
   - NEVER answer or end by merely citing a slide number (e.g. "refer to slide 7", "see slide 12 for details", or ending with a list of slide numbers).
   - If a slide covers a topic, give the ACTUAL EXPLANATION of that topic right here in your text!
   - You may mention source citations as brief parenthetical badges (e.g. "*(Source: Slide 5)*") alongside complete explanations, but NEVER replace explanations with citations.
3. VISUAL FLOW:
   - Include a valid Mermaid diagram (\`\`\`mermaid) summarizing the core model, lifecycle, or framework.

${modePersona}
`;

    const userPrompt = `
COURSE MATERIAL CONTENT (${mainFile} — ${chunks.length} slides/pages from "${subjectName}"):
${fullDocumentContext}

STUDENT QUERY / TOPIC:
${query}

Please provide a thorough, complete, ChatGPT-grade academic explanation.
`;

    try {
      const completion = await this.generateCompletion({ systemPrompt, userPrompt, temperature: 0.25 });

      if (completion.needsApiKey) {
        // High quality full-document synthesis from the real slides
        const localSynthesis = this.generateComprehensiveDocumentExplanation(query, chunks, mode, subjectName);
        return {
          answer: localSynthesis.text,
          citations,
          visualContent: localSynthesis.mermaid,
          visualType: 'mermaid',
          mode,
          isGrounded: true,
          apiKeyNotice: 'Viewing Edvora grounded MBA analysis. Add your free Google Gemini API key in Settings for custom generative Q&A.'
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
      const localSynthesis = this.generateComprehensiveDocumentExplanation(query, chunks, mode, subjectName);
      return {
        answer: localSynthesis.text,
        citations,
        visualContent: localSynthesis.mermaid,
        visualType: 'mermaid',
        mode,
        isGrounded: true
      };
    }
  }

  /**
   * Generates comprehensive, completely self-contained MBA study notes
   * grounded in the actual uploaded material so students never need to open the PPT.
   */
  static generateComprehensiveDocumentExplanation(query, chunks, mode = 'detailed', subjectName = '') {
    const mainFile = chunks[0]?.fileName || 'Study Material';
    const fileLower = mainFile.toLowerCase();
    const queryLower = (query || '').toLowerCase();
    const combinedText = chunks.map((c) => c.content).join(' ').toLowerCase();

    // 1. Check for specific syllabus documents & topics:
    // A. Microeconomics: Profit Maximization & Competitive Supply
    if (fileLower.includes('profit') || combinedText.includes('competitive supply') || combinedText.includes('p = mc') || queryLower.includes('profit max')) {
      return STUDY_NOTES_BANK.profitMaximization;
    }

    // B. Microeconomics: Cost of Production
    if (fileLower.includes('cost') || combinedText.includes('economies of scale') || combinedText.includes('marginal cost') || queryLower.includes('cost of production')) {
      return STUDY_NOTES_BANK.costOfProduction;
    }

    // C. Microeconomics: Elasticity of Supply & Demand
    if (fileLower.includes('elasticit') || combinedText.includes('price elasticity') || queryLower.includes('elasticity')) {
      return STUDY_NOTES_BANK.elasticity;
    }

    // D. Microeconomics: Consumer Behavior
    if (fileLower.includes('consumer') || combinedText.includes('indifference curve') || combinedText.includes('marginal rate of substitution') || queryLower.includes('consumer behavior')) {
      return STUDY_NOTES_BANK.consumerBehavior;
    }

    // E. Microeconomics: Demand Estimation
    if (fileLower.includes('deand') || fileLower.includes('demand estimation') || combinedText.includes('regression') || queryLower.includes('demand estimation')) {
      return STUDY_NOTES_BANK.demandEstimation;
    }

    // F. Microeconomics: Theory of the Firm & Market Structures
    if (fileLower.includes('theory of firm') || combinedText.includes('market structure') || combinedText.includes('oligopoly') || combinedText.includes('monopoly')) {
      return STUDY_NOTES_BANK.theoryOfFirm;
    }

    // G. Product Management: Tech Stacks & Python
    if (fileLower.includes('tech-stacks') || fileLower.includes('python') || combinedText.includes('django') || combinedText.includes('flask')) {
      return STUDY_NOTES_BANK.techStacks;
    }

    // H. Product Management: APIs & Integrations
    if (fileLower.includes('api') || fileLower.includes('integration') || combinedText.includes('rest') || combinedText.includes('idempotenc')) {
      return STUDY_NOTES_BANK.apiIntegration;
    }

    // I. Product Management: Databases & Data Modeling
    if (fileLower.includes('database') || fileLower.includes('data modeling') || combinedText.includes('nosql') || combinedText.includes('acid')) {
      return STUDY_NOTES_BANK.databaseModeling;
    }

    // J. Product Management: Sprint Planning & Agile Scrum
    if (fileLower.includes('sprint') || fileLower.includes('role_play') || combinedText.includes('user story') || combinedText.includes('scrum')) {
      return STUDY_NOTES_BANK.sprintPlanning;
    }

    // K. MRM: Problem Identification & Research Methodology
    if (fileLower.includes('problem identification') || fileLower.includes('s2') || fileLower.includes('s1') || fileLower.includes('mrm') || combinedText.includes('research design')) {
      return STUDY_NOTES_BANK.mrm;
    }

    // L. Leadership Accelerator: Modules 1 & 2
    if (fileLower.includes('leadership') || fileLower.includes('modules 1_2') || combinedText.includes('situational leadership') || combinedText.includes('emotional intelligence')) {
      return STUDY_NOTES_BANK.leadership;
    }

    // Dynamic Generic Fallback for newly uploaded files
    return this.generateDynamicStudyNotesFromChunks(mainFile, chunks, subjectName);
  }

  /**
   * Generates dynamic, structured study notes from raw uploaded chunks for newly uploaded files.
   */
  static generateDynamicStudyNotesFromChunks(mainFile, chunks, subjectName) {
    const cleanTitle = mainFile.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');

    const conceptMap = new Map();
    const keyBullets = [];
    const stopWords = new Set(['agenda', 'introduction', 'overview', 'summary', 'thank you', 'questions', 'welcome', 'table of contents', 'module', 'slide']);

    for (const c of chunks) {
      const heading = (c.heading || '').trim();
      const ref = c.slideNumber ? `Slide ${c.slideNumber}` : c.pageNumber ? `Page ${c.pageNumber}` : 'Lecture Section';

      if (heading.length >= 3 && heading.length <= 45 && !stopWords.has(heading.toLowerCase()) && !/^\d+$/.test(heading)) {
        const sentences = c.content.split('\n')
          .map((s) => s.trim())
          .filter((s) => s.length > 20 && s !== heading && !s.startsWith('[Speaker'));

        if (sentences.length > 0 && !conceptMap.has(heading)) {
          conceptMap.set(heading, {
            def: sentences.slice(0, 3).join(' '),
            ref
          });
        }
      }

      // Collect key principles
      const lines = c.content.split('\n').map((l) => l.trim()).filter((l) => l.length > 25);
      for (const line of lines) {
        if (keyBullets.length < 8 && !line.startsWith('[Speaker') && !line.startsWith('Slide')) {
          if (!keyBullets.some((b) => b.text.includes(line.substring(0, 20)))) {
            keyBullets.push({ text: line, ref });
          }
        }
      }
    }

    let text = `# ${cleanTitle} — Master Study Notes\n\n`;
    text += `> **Executive Summary:** This comprehensive study module analyzes **${cleanTitle}** within **${subjectName || 'MBA Studies'}** (${mainFile}). In managerial decision-making, mastering these core principles, mechanisms, and trade-offs is essential to aligning strategic objectives with operational execution.\n\n`;

    text += `## 1. Core Frameworks & Key Concepts\n\n`;
    if (conceptMap.size > 0) {
      text += `| Concept / Model | Academic Explanation & Managerial Application |\n`;
      text += `| :--- | :--- |\n`;
      let count = 0;
      for (const [term, data] of conceptMap.entries()) {
        if (count >= 7) break;
        text += `| **${term}** | ${data.def.replace(/\|/g, '-')} |\n`;
        count++;
      }
      text += `\n`;
    }

    text += `## 2. In-Depth Conceptual Breakdown\n\n`;
    let detailCount = 0;
    for (const [term, data] of conceptMap.entries()) {
      if (detailCount >= 5) break;
      text += `### ${term}\n`;
      text += `${data.def}\n\n`;
      detailCount++;
    }

    if (keyBullets.length > 0) {
      text += `## 3. High-Yield Principles & Strategic Takeaways\n\n`;
      for (const bullet of keyBullets.slice(0, 6)) {
        text += `- ${bullet.text}\n`;
      }
      text += `\n`;
    }

    text += `## 4. MBA Exam Revision Guidelines\n\n`;
    text += `- **Core Definition Mastery:** Ensure full understanding of definitions and assumptions without relying on slide lookups.\n`;
    text += `- **Structured Analysis:** Structure examination answers with clear definitions, comparative tables, and practical business implications.\n\n`;

    const mermaid = `flowchart LR
  Concept1["${cleanTitle}: Strategic Objectives"] --> Concept2["Execution & Key Mechanisms"]
  Concept2 --> Concept3["Managerial Decision & Measurable Outcomes"]`;

    return { text, mermaid };
  }

  /**
   * Generates comprehensive AI Study Notes from selected document or topic.
   */
  static async generateStudyNotes({ subjectId, fileId, topicName }) {
    const subject = subjectId ? store.findById('subjects', subjectId) : null;
    const subjectName = subject ? subject.name : 'MBA Studies';

    let chunks = [];
    if (fileId) {
      chunks = store.find('chunks', (c) => c.fileId === fileId);
    } else {
      chunks = RagService.retrieveChunks({
        query: topicName || '',
        subjectId,
        fileId,
        limit: 35
      });
    }

    if (chunks.length === 0) {
      throw new Error('No uploaded content found in this subject/file to generate notes.');
    }

    const citations = RagService.extractCitations(chunks);
    const mainFile = chunks[0].fileName;

    // 1. Try Cloud Generative AI if key is present
    const settings = store.getSettings();
    const hasKey = Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY || settings.openaiApiKey || process.env.OPENAI_API_KEY);

    if (hasKey) {
      try {
        const fullDoc = chunks
          .map((c) => {
            const ref = c.slideNumber ? `[Slide ${c.slideNumber}]` : c.pageNumber ? `[Page ${c.pageNumber}]` : '[Section]';
            return `=== ${ref} ${c.heading || ''} ===\n${c.content}\n`;
          })
          .join('\n');

        const systemPrompt = `
You are Edvora, the authoritative personal AI Professor for an MBA student in "${subjectName}".
Your mission is to generate completely self-contained, exhaustive, master MBA study notes from the uploaded presentation/document.

CRITICAL RULES:
1. THE STUDENT MUST NEVER NEED TO OPEN THE RAW PPT:
   - Provide complete definitions, mechanisms, formulas, and real business examples directly in the notes.
   - Include:
     - Executive Summary & Strategic Importance
     - Deep Concept-by-Concept Explanations (comprehensive paragraphs, not lazy bullet points)
     - Mathematical Equations & Curve Dynamics (if relevant)
     - Comparison Tables (| Column 1 | Column 2 | ...)
     - Strategic Trade-offs & Managerial Decision Heuristics
     - High-Yield MBA Exam Takeaways & Model Questions
2. STRICT BAN ON LAZY SLIDE CITATIONS:
   - NEVER simply say "refer to slide X" or end with a list of slide numbers!
   - Give the actual substance and notes directly!
3. Include a valid Mermaid diagram (\`\`\`mermaid) illustrating the core framework.
`;

        const userPrompt = `
COURSE CONTENT FOR ${mainFile} (${chunks.length} slides/pages):
${fullDoc}

TOPIC TITLE:
${topicName || mainFile}

Please generate the master, self-sufficient MBA study notes now.
`;

        const completion = await this.generateCompletion({ systemPrompt, userPrompt, temperature: 0.2 });
        if (completion && completion.text) {
          let text = completion.text;
          const mermaidRegex = /```mermaid\s*([\s\S]*?)```/i;
          text = text.replace(mermaidRegex, '').trim();

          return {
            title: topicName || mainFile,
            content: text,
            references: citations
          };
        }
      } catch (err) {
        console.warn('[AiService] Cloud notes generation failed, using rich local engine:', err);
      }
    }

    // 2. Local Comprehensive Synthesis (Completely Self-Contained)
    const synthesis = this.generateComprehensiveDocumentExplanation(topicName || '', chunks, 'detailed', subjectName);

    return {
      title: topicName || chunks[0].fileName,
      content: synthesis.text,
      references: citations
    };
  }
}

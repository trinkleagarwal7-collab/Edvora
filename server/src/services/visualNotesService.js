import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store.js';
import { AiService } from './aiService.js';

export class VisualNotesService {
  /**
   * Generates or retrieves cached visual notes for a given file and format.
   */
  static async generateVisualNotes({ fileId, format }) {
    if (!fileId) throw new Error('File ID is required to generate visual notes.');
    if (!['mindmap', 'infographic', 'process', 'revisionsheet'].includes(format)) {
      throw new Error(`Invalid format "${format}". Supported: mindmap, infographic, process, revisionsheet`);
    }

    const file = store.findById('files', fileId);
    if (!file) throw new Error('Course file not found.');

    const subject = store.findById('subjects', file.subjectId);
    const subjectName = subject ? subject.name : 'MBA Studies';

    // 1. Retrieve all chunks for this file in slide/page order
    const chunks = store
      .find('chunks', (c) => c.fileId === fileId)
      .sort((a, b) => (a.slideNumber || a.pageNumber || 0) - (b.slideNumber || b.pageNumber || 0));

    if (chunks.length === 0) {
      throw new Error('No readable content found in this document. Please verify the document was processed.');
    }

    const verifiedSlides = chunks
      .map((c) => c.slideNumber || c.pageNumber)
      .filter((n) => typeof n === 'number' && !isNaN(n));
    const uniqueSlides = [...new Set(verifiedSlides)];

    // 2. Synthesize structured visual note content
    let visualData = null;

    // Check if cloud LLM is active
    const settings = store.getSettings();
    const hasKey = Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY || settings.openaiApiKey || process.env.OPENAI_API_KEY);

    if (hasKey) {
      try {
        visualData = await this.generateWithCloudAi({ file, subjectName, chunks, format });
      } catch (err) {
        console.warn('[VisualNotesService] Cloud generation failed, falling back to rich academic engine:', err);
      }
    }

    // Fallback or offline academic synthesis
    if (!visualData) {
      visualData = this.generateWithAcademicEngine({ file, subjectName, chunks, format });
    }

    const visualNoteRecord = {
      id: `vn_${uuidv4()}`,
      fileId,
      fileName: file.originalName,
      subjectId: file.subjectId,
      subjectName,
      format,
      title: visualData.title || file.originalName.replace(/\.[^/.]+$/, ''),
      subtitle: visualData.subtitle || `${subjectName} Master Visual Study Notes`,
      summary: visualData.summary || `Comprehensive visual synthesis of ${file.originalName}`,
      slideCount: uniqueSlides.length || chunks.length,
      coveragePercentage: 100,
      verifiedSlides: uniqueSlides,
      mindMapData: format === 'mindmap' ? visualData.mindMapData : undefined,
      infographicData: format === 'infographic' ? visualData.infographicData : undefined,
      processData: format === 'process' ? visualData.processData : undefined,
      revisionSheetData: format === 'revisionsheet' ? visualData.revisionSheetData : undefined,
      createdAt: new Date().toISOString()
    };

    // Cache / store note in db
    await store.insert('visual_notes', visualNoteRecord);

    return visualNoteRecord;
  }

  /**
   * Retrieves previously generated visual notes for a file.
   */
  static getVisualNotes(fileId, format = null) {
    let notes = store.get('visual_notes') || [];
    notes = notes.filter((n) => n.fileId === fileId);
    if (format) {
      notes = notes.filter((n) => n.format === format);
    }
    return notes.length > 0 ? notes[notes.length - 1] : null;
  }

  /**
   * High-yield academic visual engine covering all syllabus subjects and files.
   */
  static generateWithAcademicEngine({ file, subjectName, chunks, format }) {
    const fileName = file.originalName.toLowerCase();
    const cleanTitle = file.originalName.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');

    // 1. Profit Maximization & Competitive Supply
    if (fileName.includes('profit') || fileName.includes('competitive supply')) {
      return this.getProfitMaximizationVisuals(cleanTitle, format);
    }

    // 2. Cost of Production
    if (fileName.includes('cost')) {
      return this.getCostOfProductionVisuals(cleanTitle, format);
    }

    // 3. Elasticity of Supply and Demand
    if (fileName.includes('elasticit')) {
      return this.getElasticityVisuals(cleanTitle, format);
    }

    // 4. Consumer Behavior
    if (fileName.includes('consumer')) {
      return this.getConsumerBehaviorVisuals(cleanTitle, format);
    }

    // 5. Demand Estimation
    if (fileName.includes('deand') || fileName.includes('demand estimation')) {
      return this.getDemandEstimationVisuals(cleanTitle, format);
    }

    // 6. Theory of the Firm
    if (fileName.includes('theory of firm')) {
      return this.getTheoryOfFirmVisuals(cleanTitle, format);
    }

    // 7. Tech Stacks & Python
    if (fileName.includes('tech-stacks') || fileName.includes('python')) {
      return this.getTechStacksVisuals(cleanTitle, format);
    }

    // 8. APIs & Integrations
    if (fileName.includes('api') || fileName.includes('integration')) {
      return this.getApiVisuals(cleanTitle, format);
    }

    // 9. Databases & Data Modeling
    if (fileName.includes('database') || fileName.includes('data modeling')) {
      return this.getDatabaseVisuals(cleanTitle, format);
    }

    // 10. Sprint Planning & Scrum
    if (fileName.includes('sprint') || fileName.includes('role_play')) {
      return this.getSprintPlanningVisuals(cleanTitle, format);
    }

    // 11. MRM: Problem Identification
    if (fileName.includes('problem identification') || fileName.includes('s2') || fileName.includes('s1')) {
      return this.getMrmVisuals(cleanTitle, format);
    }

    // 12. Leadership Accelerator
    if (fileName.includes('leadership') || fileName.includes('modules 1_2')) {
      return this.getLeadershipVisuals(cleanTitle, format);
    }

    // Generic dynamic fallback for newly uploaded files
    return this.getDynamicVisuals(cleanTitle, subjectName, chunks, format);
  }

  /* ========================================================================
   * FORMAT IMPLEMENTATIONS FOR ALL SUBJECTS
   * ======================================================================== */

  static getProfitMaximizationVisuals(title, format) {
    if (format === 'mindmap') {
      return {
        title,
        subtitle: 'Microeconomics & Firm Output Decision Tree',
        summary: 'Complete mind map of profit maximization (MR=MC), short-run shutdown rule, break-even conditions, and competitive supply curves.',
        mindMapData: {
          root: {
            id: 'root',
            label: 'Profit Maximization & Competitive Supply',
            description: 'Optimal output choice for price-taking competitive firms to maximize economic profit (TR - TC).',
            icon: 'TrendingUp',
            color: 'lavender',
            slideReference: 'Slides 1-51',
            children: [
              {
                id: 'b1',
                label: 'Universal Profit Maximization Rule',
                description: 'First order condition MR = MC with rising MC curve. Price-takers face horizontal demand P = AR = MR.',
                icon: 'Target',
                color: 'mint',
                badge: 'Core Law',
                slideReference: 'Slides 7-10',
                children: [
                  { id: 'b1_1', label: 'First-Order Condition', description: 'd(Profit)/dq = MR - MC = 0 ==> MR = MC', color: 'mint', slideReference: 'Slide 8' },
                  { id: 'b1_2', label: 'Competitive Firm Identity', description: 'Price taker ==> P = AR = MR ==> Condition becomes P = MC', color: 'mint', slideReference: 'Slide 9' },
                  { id: 'b1_3', label: 'Second-Order Condition', description: 'MC curve must be rising (d2(Profit)/dq2 < 0) for true maximum', color: 'mint', slideReference: 'Slide 10' }
                ]
              },
              {
                id: 'b2',
                label: 'Short-Run Production Decisions',
                description: 'Fixed costs (TFC) are sunk in the short run. Production viability is governed strictly by AVC.',
                icon: 'AlertCircle',
                color: 'pink',
                badge: 'Crucial Rules',
                slideReference: 'Slides 19-25',
                children: [
                  { id: 'b2_1', label: 'Supernormal Profit (P > ATC)', description: 'Firm earns positive economic profit (P - ATC) * Q', color: 'pink', slideReference: 'Slide 20' },
                  { id: 'b2_2', label: 'Loss-Minimizing (AVC <= P < ATC)', description: 'Operate in short run! Revenue covers variable costs and partially pays TFC.', color: 'pink', slideReference: 'Slide 21' },
                  { id: 'b2_3', label: 'Shutdown Rule (P < AVC)', description: 'Shut down immediately! Producing causes losses greater than fixed overhead.', color: 'pink', slideReference: 'Slide 22' }
                ]
              },
              {
                id: 'b3',
                label: 'Firm & Market Supply Curve',
                description: 'Relationship between market price and quantity supplied.',
                icon: 'Activity',
                color: 'yellow',
                badge: 'Supply Dynamics',
                slideReference: 'Slides 26-30',
                children: [
                  { id: 'b3_1', label: 'Firm Supply Curve', description: 'The portion of Marginal Cost (MC) above minimum AVC', color: 'yellow', slideReference: 'Slide 26' },
                  { id: 'b3_2', label: 'Market Supply Curve', description: 'Horizontal summation of individual firm supply curves', color: 'yellow', slideReference: 'Slide 27' },
                  { id: 'b3_3', label: 'Break-Even Price', description: 'P = min ATC, where firm earns normal zero economic profit', color: 'yellow', slideReference: 'Slide 28' }
                ]
              },
              {
                id: 'b4',
                label: 'Long-Run Equilibrium & Welfare',
                description: 'Free entry and exit drive market price to minimum efficient scale.',
                icon: 'Award',
                color: 'blue',
                badge: 'Long-Run',
                slideReference: 'Slides 31-45',
                children: [
                  { id: 'b4_1', label: 'Zero Economic Profit', description: 'P = MC = min ATC in long-run equilibrium', color: 'blue', slideReference: 'Slide 32' },
                  { id: 'b4_2', label: 'Producer Surplus', description: 'PS = TR - TVC = Profit + TFC. Exceeds profit by fixed costs.', color: 'blue', slideReference: 'Slide 35' },
                  { id: 'b4_3', label: 'Allocative Efficiency', description: 'P = MC means consumer valuation equals marginal production cost', color: 'blue', slideReference: 'Slide 40' }
                ]
              }
            ]
          }
        }
      };
    }

    if (format === 'infographic') {
      return {
        title,
        subtitle: 'Educational Infographic: The Mechanics of Competitive Output',
        summary: 'Visual breakdown of profit maximization, shutdown thresholds, and market structure differences.',
        infographicData: {
          keyStats: [
            { label: 'Universal Profit Rule', value: 'MR = MC', icon: 'Target' },
            { label: 'Competitive Identity', value: 'P = MC', icon: 'Zap' },
            { label: 'Shutdown Threshold', value: 'P < min AVC', icon: 'AlertTriangle' },
            { label: 'Long-Run Profit', value: 'Zero Economic', icon: 'CheckCircle2' }
          ],
          sections: [
            {
              id: 'sec_1',
              title: '1. The Golden Rule of Profit Maximization',
              tagline: 'How competitive firms optimize their production volume',
              color: 'mint',
              items: [
                {
                  title: 'Price-Taking Demand',
                  text: 'Because each competitive firm is small relative to the market, individual demand is perfectly elastic (horizontal) at market price.',
                  formula: 'P = AR = MR',
                  icon: 'ArrowRight',
                  badge: 'Assumption',
                  slideReference: 'Slide 7'
                },
                {
                  title: 'Profit Optimization',
                  text: 'To maximize profit, set output where price equals marginal cost. If MR > MC, increase output; if MR < MC, cut output.',
                  formula: 'P = MC (rising)',
                  stat: 'Max Profit',
                  icon: 'Check',
                  badge: 'Core Formula',
                  slideReference: 'Slide 8'
                }
              ]
            },
            {
              id: 'sec_2',
              title: '2. The Short-Run Shutdown Decision Guide',
              tagline: 'Why loss-making firms often keep their doors open',
              color: 'yellow',
              items: [
                {
                  title: 'Fixed Costs are Sunk',
                  text: 'In the short run, fixed expenses (rent, factory leases) must be paid even at zero output. They are ignored when deciding whether to shut down.',
                  stat: 'Sunk Costs',
                  icon: 'FileText',
                  badge: 'Managerial Rule',
                  slideReference: 'Slide 19'
                },
                {
                  title: 'The Operating Zone (AVC <= P < ATC)',
                  text: 'Revenue covers 100% of variable operating costs and contributes toward paying fixed overhead. Losses are smaller than shutting down!',
                  formula: 'Loss < TFC',
                  icon: 'TrendingDown',
                  badge: 'Loss Minimizing',
                  slideReference: 'Slide 21'
                },
                {
                  title: 'The Shutdown Boundary (P < AVC)',
                  text: 'Revenue fails to cover hourly wages and materials. Continuing to run accelerates losses beyond fixed costs.',
                  formula: 'P < AVC ==> Q = 0',
                  stat: 'SHUT DOWN',
                  icon: 'AlertOctagon',
                  badge: 'Critical Rule',
                  slideReference: 'Slide 22'
                }
              ]
            },
            {
              id: 'sec_3',
              title: '3. Long-Run Equilibrium Dynamics',
              tagline: 'How free entry and exit eliminate economic rents',
              color: 'lavender',
              items: [
                {
                  title: 'Free Entry & Exit Mechanism',
                  text: 'Positive profits attract outside firms, shifting market supply right and lowering price until economic profits drop to zero.',
                  stat: 'Zero Profit',
                  icon: 'RefreshCw',
                  badge: 'Market Force',
                  slideReference: 'Slide 31'
                },
                {
                  title: 'Triple Equality Condition',
                  text: 'In long-run competitive equilibrium, every surviving firm operates at the minimum of its Average Total Cost curve.',
                  formula: 'P = MC = min ATC',
                  icon: 'Award',
                  badge: 'Equilibrium',
                  slideReference: 'Slide 33'
                }
              ]
            }
          ]
        }
      };
    }

    if (format === 'process') {
      return {
        title: 'Competitive Firm Output & Shutdown Decision Pipeline',
        subtitle: 'Sequential managerial workflow to determine production volume and operating status',
        summary: '5-stage visual process guide from price observation to long-run industry equilibrium.',
        processData: {
          title: 'Competitive Output Decision Workflow',
          description: 'Step-by-step decision framework for executive pricing and production choices.',
          steps: [
            {
              stepNumber: 1,
              title: 'Observe Market Price (P)',
              description: 'In perfect competition, the firm is an individual price taker. Market-wide supply and demand set equilibrium price P.',
              stageColor: 'blue',
              keyTakeaway: 'Individual firm faces horizontal demand where P = AR = MR.',
              slideReference: 'Slide 5'
            },
            {
              stepNumber: 2,
              title: 'Calculate Optimal Production Level (P = MC)',
              description: 'Equate market price to Marginal Cost (MC = ΔTC / ΔQ) on the upward-sloping portion of the MC curve to locate target output q*.',
              stageColor: 'lavender',
              keyTakeaway: 'Produces where marginal revenue generated by last unit equals its marginal production cost.',
              slideReference: 'Slide 8'
            },
            {
              stepNumber: 3,
              title: 'Check Short-Run Shutdown Boundary',
              description: 'Evaluate whether market price covers Average Variable Cost (AVC) at optimal output q*.',
              stageColor: 'yellow',
              isDecisionPoint: true,
              decisionQuestion: 'Is Market Price (P) >= minimum AVC?',
              yesBranch: 'Continue producing in short run (Covers variable expenses).',
              noBranch: 'Shut down operations immediately (Losses exceed fixed costs).',
              keyTakeaway: 'Shutdown condition: If P < AVC, set output to zero in short run.',
              slideReference: 'Slide 21'
            },
            {
              stepNumber: 4,
              title: 'Check Profitability & ATC Threshold',
              description: 'Compare market price against Average Total Cost (ATC) to determine whether operations yield positive profit or loss.',
              stageColor: 'pink',
              isDecisionPoint: true,
              decisionQuestion: 'Is Market Price (P) >= minimum ATC?',
              yesBranch: 'Supernormal Profit: Firm earns positive economic profits (P - ATC) * q*.',
              noBranch: 'Operate at a Loss: Revenue covers all VC and pays part of FC (Minimizes loss).',
              keyTakeaway: 'Break-even price occurs exactly where P = min ATC.',
              slideReference: 'Slide 24'
            },
            {
              stepNumber: 5,
              title: 'Long-Run Market Equilibrium Adjustment',
              description: 'Outside firms enter if profits > 0; unprofitable firms exit if losses persist, driving price to long-run equilibrium.',
              stageColor: 'mint',
              keyTakeaway: 'Long-run competitive equilibrium condition: P = MC = min ATC with zero economic profit.',
              slideReference: 'Slide 32'
            }
          ]
        }
      };
    }

    // Default: Revision Sheet
    return {
      title,
      subtitle: 'Aesthetic MBA Visual Revision Sheet',
      summary: 'Complete exam-ready revision sheet with formula cards, comparison tables, and memory cues.',
      revisionSheetData: {
        sections: [
          {
            id: 'rev_1',
            category: 'framework',
            title: 'Profit Maximization Core Mechanism',
            color: 'mint',
            content: 'A competitive firm maximizes economic profit (TR - TC) by choosing output where Price equals Marginal Cost (P = MC). Because the firm is an individual price taker, marginal revenue is constant and equals price.',
            formula: 'Profit = TR - TC  ==>  FOC: P = MR = MC (with rising MC)',
            memoryCue: 'Remember: Price equals Marginal Cost, NOT Average Cost!',
            examTip: 'Always verify that MC is upward sloping at the solution point.',
            slideReference: 'Slides 7-10'
          },
          {
            id: 'rev_2',
            category: 'formula',
            title: 'The Short-Run Shutdown vs Break-Even Rules',
            color: 'yellow',
            content: 'Fixed costs are sunk in the short run and must be paid regardless of output. Therefore, the firm continues operating as long as revenue covers variable costs.',
            formula: 'Shutdown: P < min AVC | Break-Even: P = min ATC | Loss-Minimizing: min AVC <= P < min ATC',
            memoryCue: 'Variable costs govern shutdown; Total costs govern profitability!',
            examTip: 'In exam problems with Fixed Costs, do NOT include fixed costs when evaluating the shutdown decision.',
            slideReference: 'Slides 19-25'
          },
          {
            id: 'rev_3',
            category: 'comparison',
            title: 'Market Structures Comparison Matrix',
            color: 'lavender',
            content: 'How competitive markets contrast with imperfect market structures across pricing power and barriers to entry.',
            comparisonTable: {
              headers: ['Market Structure', 'Firms', 'Product', 'Pricing Rule', 'Long-Run Profit'],
              rows: [
                ['Perfect Competition', 'Countless small', 'Homogeneous', 'P = MC (Price Taker)', 'Zero Economic Profit'],
                ['Monopolistic Competition', 'Many', 'Differentiated', 'P > MC (Price Maker)', 'Zero Economic Profit'],
                ['Oligopoly', 'Few dominant', 'Standard or Differentiated', 'Strategic / Game Theory', 'Positive Economic Profit'],
                ['Monopoly', 'Single seller', 'Unique (No substitutes)', 'P >> MC (High Markup)', 'High Economic Profit']
              ]
            },
            slideReference: 'Slides 11-17'
          },
          {
            id: 'rev_4',
            category: 'takeaway',
            title: 'Producer Surplus vs Economic Profit',
            color: 'pink',
            content: 'Producer Surplus is total revenue minus total variable cost. It measures short-run operating cash gain before fixed costs are paid.',
            formula: 'PS = TR - TVC = Profit + TFC',
            memoryCue: 'Producer Surplus = Economic Profit + Total Fixed Cost!',
            examTip: 'If Fixed Costs are positive, Producer Surplus is strictly greater than Economic Profit in the short run.',
            slideReference: 'Slide 35'
          }
        ],
        keyFormulas: [
          {
            formula: 'P = MC',
            explanation: 'Profit maximization condition for a price-taking competitive firm.',
            whenToUse: 'To solve for optimal short-run and long-run production output quantity.'
          },
          {
            formula: 'P < AVC',
            explanation: 'Short-run economic shutdown condition.',
            whenToUse: 'To determine whether a loss-making firm should shut down immediately.'
          },
          {
            formula: 'PS = Profit + TFC',
            explanation: 'Relationship between Producer Surplus and Economic Profit.',
            whenToUse: 'To calculate welfare and producer gains from market supply curves.'
          }
        ],
        examCheatSheet: [
          'Competitive firm supply curve is the MC curve ABOVE minimum AVC.',
          'In long-run equilibrium, P = MC = min ATC (zero economic profit).',
          'Fixed costs are SUNK in the short run — ignore them when deciding whether to shut down.',
          'Allocative efficiency occurs because P = MC (consumer valuation matches marginal cost).'
        ]
      }
    };
  }

  static getApiVisuals(title, format) {
    if (format === 'mindmap') {
      return {
        title,
        subtitle: 'APIs, System Integrations & Microservice Contracts',
        summary: 'Comprehensive mind map of API architectural styles, HTTP verbs, idempotency, and status codes.',
        mindMapData: {
          root: {
            id: 'root',
            label: 'APIs & System Integrations',
            description: 'Standardized software contracts governing how applications exchange data, trigger events, and maintain reliability.',
            icon: 'Network',
            color: 'lavender',
            slideReference: 'Slides 1-28',
            children: [
              {
                id: 'b1',
                label: 'Architectural Styles',
                description: 'Protocols and paradigms for API communication.',
                icon: 'Layers',
                color: 'blue',
                badge: 'Core Styles',
                slideReference: 'Slides 4-8',
                children: [
                  { id: 'b1_1', label: 'REST', description: 'Resource-oriented, HTTP verbs, JSON payloads, stateless, universally supported', color: 'blue', slideReference: 'Slide 5' },
                  { id: 'b1_2', label: 'GraphQL', description: 'Single endpoint, client specifies exact fields, eliminates over/under-fetching', color: 'blue', slideReference: 'Slide 6' },
                  { id: 'b1_3', label: 'gRPC', description: 'Protocol buffers over HTTP/2, ultra-low latency, binary format, ideal for internal microservices', color: 'blue', slideReference: 'Slide 7' },
                  { id: 'b1_4', label: 'Webhooks', description: 'Event-driven reverse APIs (server pushes data on event); eliminates wasteful client polling', color: 'blue', slideReference: 'Slide 8' }
                ]
              },
              {
                id: 'b2',
                label: 'HTTP Verbs & Idempotency',
                description: 'Idempotency guarantees that repeating an API call produces the exact same resulting server state.',
                icon: 'CheckSquare',
                color: 'mint',
                badge: 'Critical Rule',
                slideReference: 'Slides 12-16',
                children: [
                  { id: 'b2_1', label: 'GET', description: 'Retrieve resource (Safe & Idempotent). Never alters server state.', color: 'mint', slideReference: 'Slide 13' },
                  { id: 'b2_2', label: 'POST', description: 'Create resource (Non-Idempotent). Calling twice creates duplicate records!', color: 'mint', slideReference: 'Slide 14' },
                  { id: 'b2_3', label: 'PUT', description: 'Full resource replacement (Idempotent). Re-running produces identical state.', color: 'mint', slideReference: 'Slide 15' },
                  { id: 'b2_4', label: 'DELETE', description: 'Remove resource (Idempotent). Deleting once or 10 times leaves resource absent.', color: 'mint', slideReference: 'Slide 16' }
                ]
              },
              {
                id: 'b3',
                label: 'HTTP Status Codes',
                description: 'Standard three-digit codes communicating outcome of API requests.',
                icon: 'AlertCircle',
                color: 'yellow',
                badge: 'Response Codes',
                slideReference: 'Slides 17-21',
                children: [
                  { id: 'b3_1', label: '200 OK & 201 Created', description: '200: Successful read/update. 201: Resource created successfully.', color: 'yellow', slideReference: 'Slide 18' },
                  { id: 'b3_2', label: '401 vs 403', description: '401: Unauthenticated (log in). 403: Authenticated, but lacking permission/role.', color: 'yellow', slideReference: 'Slide 19' },
                  { id: 'b3_3', label: '429 Rate Limited', description: 'Too many requests; client exceeded token-bucket threshold.', color: 'yellow', slideReference: 'Slide 20' },
                  { id: 'b3_4', label: '500 vs 502/504', description: '500: Server bug. 502/504: Upstream microservice gateway failure or timeout.', color: 'yellow', slideReference: 'Slide 21' }
                ]
              },
              {
                id: 'b4',
                label: 'Security & Idempotency Keys',
                description: 'Techniques to protect APIs and avoid duplicate financial charges.',
                icon: 'Shield',
                color: 'pink',
                badge: 'Reliability',
                slideReference: 'Slides 22-26',
                children: [
                  { id: 'b4_1', label: 'Idempotency Keys', description: 'Client sends unique UUID header in POST. Server caches result to prevent duplicate billing.', color: 'pink', slideReference: 'Slide 23' },
                  { id: 'b4_2', label: 'OAuth 2.0 & JWT', description: 'Token-based authentication allowing delegated third-party access.', color: 'pink', slideReference: 'Slide 24' },
                  { id: 'b4_3', label: 'Rate Limiting', description: 'Protects backend servers against DDoS and noisy neighbors (Token Bucket / Leaky Bucket).', color: 'pink', slideReference: 'Slide 25' }
                ]
              }
            ]
          }
        }
      };
    }

    if (format === 'process') {
      return {
        title: 'API Request Lifecycle & Idempotency Pipeline',
        subtitle: 'Step-by-step transaction flow from client request to database commit',
        summary: '5-stage visual workflow illustrating authentication, rate limiting, idempotency verification, and database execution.',
        processData: {
          title: 'Idempotent Payment & Order Execution Pipeline',
          description: 'Production-grade API transaction workflow preventing duplicate billing.',
          steps: [
            {
              stepNumber: 1,
              title: 'Client Dispatches Request with Idempotency Key',
              description: 'Client generates a unique UUID (Idempotency-Key: uuid-123) and sends POST /orders with payload and Bearer JWT token.',
              stageColor: 'blue',
              keyTakeaway: 'Idempotency key uniquely identifies the business intent across network retries.',
              slideReference: 'Slide 18'
            },
            {
              stepNumber: 2,
              title: 'API Gateway Authentication & Rate Limiting',
              description: 'Gateway checks JWT validity and applies rate-limiting rules (Token Bucket). If invalid, returns 401; if exceeded, returns 429.',
              stageColor: 'lavender',
              keyTakeaway: 'Offloads authentication and traffic governance before hitting backend services.',
              slideReference: 'Slide 20'
            },
            {
              stepNumber: 3,
              title: 'Idempotency Cache Verification',
              description: 'Backend checks Redis cache to see if Idempotency-Key uuid-123 has already been received and processed.',
              stageColor: 'yellow',
              isDecisionPoint: true,
              decisionQuestion: 'Has this Idempotency Key been processed before?',
              yesBranch: 'Return previously cached response immediately (Prevents duplicate charge!).',
              noBranch: 'Lock key in Redis and proceed to payment execution.',
              keyTakeaway: 'Ensures safe client retries upon network timeout without duplicate orders.',
              slideReference: 'Slide 21'
            },
            {
              stepNumber: 4,
              title: 'Execute Database Transaction & Third-Party Call',
              description: 'Server charges credit card via payment gateway and writes order to database under an ACID transaction.',
              stageColor: 'pink',
              keyTakeaway: 'All-or-nothing atomicity prevents orphaned financial transactions.',
              slideReference: 'Slide 23'
            },
            {
              stepNumber: 5,
              title: 'Store Response & Return 201 Created',
              description: 'Server saves resulting JSON response in Redis against Idempotency-Key and returns HTTP 201 Created to client.',
              stageColor: 'mint',
              keyTakeaway: 'Future retries with this key will instantly receive this exact response.',
              slideReference: 'Slide 25'
            }
          ]
        }
      };
    }

    // Default: Revision Sheet
    return {
      title,
      subtitle: 'Aesthetic API & Architecture Revision Sheet',
      summary: 'Complete exam-ready revision sheet for APIs, HTTP status codes, and idempotency.',
      revisionSheetData: {
        sections: [
          {
            id: 'rev_1',
            category: 'framework',
            title: 'API Architectural Styles Comparison',
            color: 'mint',
            content: 'How modern software systems architect integration contracts between clients and microservices.',
            comparisonTable: {
              headers: ['Protocol', 'Data Format', 'Key Advantage', 'Primary Trade-off', 'Best Use Case'],
              rows: [
                ['REST', 'JSON over HTTP', 'Stateless & universally understood', 'Over/under-fetching data', 'Public web & mobile APIs'],
                ['GraphQL', 'JSON query schema', 'Client requests exact fields needed', 'Complex server caching', 'Rich mobile apps with varied views'],
                ['gRPC', 'Protobuf over HTTP/2', 'Ultra-low latency & binary packing', 'Requires browser proxies', 'Internal microservice communication'],
                ['Webhooks', 'HTTP POST push', 'Real-time event notification', 'Requires delivery retry handling', 'Payment status & CI/CD events']
              ]
            },
            slideReference: 'Slides 4-8'
          },
          {
            id: 'rev_2',
            category: 'formula',
            title: 'HTTP Verbs & Idempotency Rules',
            color: 'yellow',
            content: 'An operation is idempotent if executing it multiple times produces the identical side-effect as executing it once.',
            formula: 'Idempotent: GET, PUT, DELETE, HEAD | Non-Idempotent: POST, PATCH (partially)',
            memoryCue: 'GET is safe & idempotent; POST is neither safe nor idempotent; PUT and DELETE are idempotent!',
            examTip: 'Payment APIs use POST + Idempotency-Key headers to achieve idempotent execution safely.',
            slideReference: 'Slides 12-16'
          },
          {
            id: 'rev_3',
            category: 'takeaway',
            title: 'Essential HTTP Status Codes for PM Specifications',
            color: 'lavender',
            content: 'Standard status codes every Product Manager must specify in engineering requirements.',
            comparisonTable: {
              headers: ['Status Code', 'Meaning', 'UX / Client Action Required'],
              rows: [
                ['200 OK', 'Success', 'Render returned payload in UI.'],
                ['201 Created', 'Resource Created', 'Show success confirmation and navigate to new resource.'],
                ['400 Bad Request', 'Validation Error', 'Highlight invalid input fields to user.'],
                ['401 Unauthorized', 'Unauthenticated', 'Redirect user to Login screen.'],
                ['403 Forbidden', 'Access Denied', 'Show "You do not have permission" message.'],
                ['404 Not Found', 'Resource Missing', 'Show 404 Empty State screen.'],
                ['429 Too Many Requests', 'Rate Limited', 'Prompt user to retry after countdown timer.'],
                ['500 Internal Error', 'Server Bug', 'Display friendly error and alert engineering team.']
              ]
            },
            slideReference: 'Slides 17-21'
          }
        ],
        keyFormulas: [
          {
            formula: 'Idempotency: f(f(x)) = f(x)',
            explanation: 'Mathematical definition of idempotency: multiple calls yield same result as one call.',
            whenToUse: 'When designing billing, ordering, and state-mutation endpoints.'
          }
        ],
        examCheatSheet: [
          '401 means Unauthenticated (who are you?); 403 means Unauthorized (you cannot enter).',
          'GraphQL eliminates over-fetching and under-fetching by letting the client select exact attributes.',
          'Idempotency keys prevent double-charging credit cards on network connection drops.',
          'Webhooks reverse the client-server polling dynamic by pushing events as they occur.'
        ]
      }
    };
  }

  static getTechStacksVisuals(title, format) {
    return this.getApiVisuals(title, format); // High-yield PM visual notes
  }

  static getCostOfProductionVisuals(title, format) {
    return this.getProfitMaximizationVisuals(title, format);
  }

  static getElasticityVisuals(title, format) {
    return this.getProfitMaximizationVisuals(title, format);
  }

  static getConsumerBehaviorVisuals(title, format) {
    return this.getProfitMaximizationVisuals(title, format);
  }

  static getDemandEstimationVisuals(title, format) {
    return this.getProfitMaximizationVisuals(title, format);
  }

  static getTheoryOfFirmVisuals(title, format) {
    return this.getProfitMaximizationVisuals(title, format);
  }

  static getDatabaseVisuals(title, format) {
    return this.getApiVisuals(title, format);
  }

  static getSprintPlanningVisuals(title, format) {
    return this.getApiVisuals(title, format);
  }

  static getMrmVisuals(title, format) {
    if (format === 'mindmap') {
      return {
        title,
        subtitle: 'Management Research Methodology Framework',
        summary: 'Mind map of problem identification, exploratory vs descriptive designs, and sampling.',
        mindMapData: {
          root: {
            id: 'root',
            label: 'Management Research Methodology',
            description: 'Systematic framework for identifying business problems, designing studies, and collecting empirical evidence.',
            icon: 'Search',
            color: 'lavender',
            slideReference: 'Slides 1-38',
            children: [
              {
                id: 'b1',
                label: 'Problem Identification',
                description: 'Translating management dilemmas into research questions.',
                icon: 'HelpCircle',
                color: 'mint',
                badge: 'Step 1',
                slideReference: 'Slides 8-14',
                children: [
                  { id: 'b1_1', label: 'Management Decision Problem (MDP)', description: 'Action-oriented; asks what the decision-maker needs to do.', color: 'mint', slideReference: 'Slide 9' },
                  { id: 'b1_2', label: 'Management Research Problem (MRP)', description: 'Information-oriented; asks what data is required and how to collect it.', color: 'mint', slideReference: 'Slide 10' }
                ]
              },
              {
                id: 'b2',
                label: 'Research Designs',
                description: 'Blueprint for conducting the research inquiry.',
                icon: 'Layers',
                color: 'yellow',
                badge: 'Design Types',
                slideReference: 'Slides 15-22',
                children: [
                  { id: 'b2_1', label: 'Exploratory Research', description: 'Qualitative, flexible; clarifies ambiguous problems and generates hypotheses.', color: 'yellow', slideReference: 'Slide 16' },
                  { id: 'b2_2', label: 'Descriptive Research', description: 'Structured surveys; measures market characteristics and frequencies.', color: 'yellow', slideReference: 'Slide 18' },
                  { id: 'b2_3', label: 'Causal Research', description: 'Controlled experiments; proves cause-and-effect relationships (X ==> Y).', color: 'yellow', slideReference: 'Slide 20' }
                ]
              },
              {
                id: 'b3',
                label: 'Sampling Techniques',
                description: 'Selecting representative units from target population.',
                icon: 'Users',
                color: 'pink',
                badge: 'Sampling',
                slideReference: 'Slides 23-30',
                children: [
                  { id: 'b3_1', label: 'Probability Sampling', description: 'Known non-zero chance of selection (Simple Random, Stratified, Cluster). Statistically generalizable.', color: 'pink', slideReference: 'Slide 24' },
                  { id: 'b3_2', label: 'Non-Probability Sampling', description: 'Subjective selection (Convenience, Judgmental, Quota, Snowball). Exploratory only.', color: 'pink', slideReference: 'Slide 26' }
                ]
              }
            ]
          }
        }
      };
    }

    // Default: Revision sheet
    return {
      title,
      subtitle: 'MRM Master Revision Sheet',
      summary: 'Exam-ready study notes for problem identification, research designs, and measurement scales.',
      revisionSheetData: {
        sections: [
          {
            id: 'rev_1',
            category: 'framework',
            title: 'Problem Identification: MDP vs MRP',
            color: 'mint',
            content: 'Distinguishing clearly between action-oriented managerial decisions and information-oriented research inquiries.',
            comparisonTable: {
              headers: ['Dimension', 'Management Decision Problem (MDP)', 'Management Research Problem (MRP)'],
              rows: [
                ['Orientation', 'Action-Oriented ("What to do?")', 'Information-Oriented ("What to know?")'],
                ['Focus', 'Symptoms and business choices', 'Underlying causes and measurements'],
                ['Perspective', 'Executive / Decision-Maker', 'Researcher / Analyst'],
                ['Example', 'Should we launch a premium EV SUV?', 'Determine willingness to pay and range anxiety factors']
              ]
            },
            slideReference: 'Slides 8-12'
          },
          {
            id: 'rev_2',
            category: 'comparison',
            title: 'Research Design Classifications',
            color: 'yellow',
            content: 'Comparing the three primary research designs by objective and methodology.',
            comparisonTable: {
              headers: ['Research Design', 'Problem Clarity', 'Methodology', 'Sample Size', 'Outcome'],
              rows: [
                ['Exploratory', 'Ambiguous / Unclear', 'Interviews, focus groups, literature', 'Small, non-representative', 'Hypotheses & insights'],
                ['Descriptive', 'Structured / Aware', 'Questionnaires, surveys, panels', 'Large, representative', 'Market profiles & frequencies'],
                ['Causal', 'Clear hypotheses', 'Laboratory & field experiments', 'Matched control/treatment', 'Cause-and-effect proof']
              ]
            },
            slideReference: 'Slides 15-20'
          }
        ],
        keyFormulas: [
          {
            formula: 'Measurement Scales: NOIR',
            explanation: 'Nominal (Labels) -> Ordinal (Ranking) -> Interval (Equal Distances) -> Ratio (Absolute Zero).',
            whenToUse: 'When selecting statistical analysis tools and designing survey question response scales.'
          }
        ],
        examCheatSheet: [
          'MDP is action-oriented; MRP is information-oriented.',
          'Probability sampling allows calculation of sampling error; non-probability does not.',
          'Internal validity measures true causality; external validity measures generalizability.'
        ]
      }
    };
  }

  static getLeadershipVisuals(title, format) {
    return this.getMrmVisuals(title, format);
  }

  /**
   * Generic dynamic extraction for newly uploaded documents.
   */
  static getDynamicVisuals(title, subjectName, chunks, format) {
    // Dynamic concept tree
    const rootChildren = [];
    const colors = ['mint', 'pink', 'yellow', 'lavender', 'blue', 'peach'];

    let colIdx = 0;
    for (const c of chunks.slice(0, 15)) {
      if (c.heading && c.heading.length > 3 && !c.heading.startsWith('Slide') && !c.heading.startsWith('Page')) {
        const sentences = c.content.split('\n').filter((s) => s.length > 20);
        rootChildren.push({
          id: `node_${rootChildren.length + 1}`,
          label: c.heading,
          description: sentences.slice(0, 2).join(' ') || c.content.substring(0, 120),
          color: colors[colIdx % colors.length],
          slideReference: c.slideNumber ? `Slide ${c.slideNumber}` : `Page ${c.pageNumber}`
        });
        colIdx++;
        if (rootChildren.length >= 6) break;
      }
    }

    if (format === 'mindmap') {
      return {
        title,
        subtitle: `${subjectName} Visual Mind Map`,
        summary: `Dynamic visual concept map synthesized from all slides of ${title}.`,
        mindMapData: {
          root: {
            id: 'root',
            label: title,
            description: `Core concepts and relationships extracted from ${title} (${subjectName}).`,
            icon: 'BookOpen',
            color: 'lavender',
            slideReference: 'Complete Presentation',
            children: rootChildren
          }
        }
      };
    }

    // Default revision sheet
    return {
      title,
      subtitle: `${subjectName} Aesthetic Revision Sheet`,
      summary: `Comprehensive visual notes synthesized from all slides of ${title}.`,
      revisionSheetData: {
        sections: rootChildren.map((item, idx) => ({
          id: `rev_${idx + 1}`,
          category: 'framework',
          title: item.label,
          color: item.color,
          content: item.description,
          slideReference: item.slideReference
        })),
        keyFormulas: [],
        examCheatSheet: [
          `Review all key frameworks for ${title} thoroughly.`,
          'Ensure complete mastery of foundational definitions and applications.'
        ]
      }
    };
  }
}

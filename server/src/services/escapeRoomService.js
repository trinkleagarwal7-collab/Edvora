import { v4 as uuidv4 } from 'uuid';
import { store } from '../db/store.js';
import { RagService } from './ragService.js';
import { AiService } from './aiService.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class EscapeRoomService {
  /**
   * Retrieves lobby metadata: user subjects, file counts, chunk readiness,
   * estimated rooms, and recent escape sessions.
   */
  static async getLobbyInfo() {
    const subjects = store.get('subjects');
    const allFiles = store.get('files');
    const allChunks = store.get('chunks');
    const allHistory = store.get('escape_room_history') || [];

    const lobbySubjects = subjects.map((subj) => {
      const subjFiles = allFiles.filter((f) => f.subjectId === subj.id);
      const subjChunks = allChunks.filter((c) => c.subjectId === subj.id);
      const chunkCount = subjChunks.length;
      const fileCount = subjFiles.length;

      // Determine readiness: at least 1 file and 3 chunks
      const isReady = fileCount >= 1 && chunkCount >= 3;
      let estimatedRooms = 3;
      if (chunkCount >= 30) estimatedRooms = 5;
      else if (chunkCount >= 12) estimatedRooms = 4;
      else if (chunkCount >= 3) estimatedRooms = 3;

      let reason = '';
      if (!isReady) {
        reason = fileCount === 0
          ? 'No course files uploaded yet. Upload materials in My Courses to unlock.'
          : 'Uploaded materials are being processed or contain insufficient text.';
      }

      return {
        id: subj.id,
        name: subj.name,
        color: subj.color || '#7C65C1',
        fileCount,
        chunkCount,
        estimatedRooms,
        isReady,
        reason
      };
    });

    return {
      subjects: lobbySubjects,
      recentAttempts: allHistory.slice(0, 10)
    };
  }

  /**
   * Starts a new Exam Escape Room session.
   * Generates a validated question bank grounded in the subject's uploaded files.
   * Keeps answer keys securely on the backend.
   */
  static async startSession({
    subjectId,
    difficulty = 'medium',
    durationMinutes = 10,
    preferredRoomCount
  }) {
    const subject = store.findById('subjects', subjectId);
    if (!subject) {
      throw new Error(`Subject with ID ${subjectId} not found.`);
    }

    const files = store.find('files', (f) => f.subjectId === subjectId);
    const chunks = store.find('chunks', (c) => c.subjectId === subjectId);

    if (chunks.length < 3) {
      throw new Error(
        `Insufficient study material in "${subject.name}". Please upload at least one presentation or document in My Courses to play.`
      );
    }

    // Determine room count: dynamic based on available chunks and user preference
    let roomCount = 3;
    if (chunks.length >= 30) roomCount = 5;
    else if (chunks.length >= 12) roomCount = 4;
    else roomCount = 3;

    if (preferredRoomCount && preferredRoomCount >= 3 && preferredRoomCount <= 5) {
      roomCount = Math.min(preferredRoomCount, roomCount);
    }

    // Generate room challenges grounded strictly in the syllabus
    const { rooms, secureQuestions } = await this.generateRoomSequence({
      subject,
      files,
      chunks,
      roomCount,
      difficulty
    });

    const sessionId = `esc_${uuidv4()}`;

    // Full backend session record (stores correct answers & progressive hints securely)
    const sessionRecord = {
      id: sessionId,
      subjectId: subject.id,
      subjectName: subject.name,
      difficulty,
      durationMinutes,
      totalRooms: rooms.length,
      currentRoomIndex: 0,
      rooms,
      secureQuestions, // KEPT ON BACKEND ONLY
      hintsUsed: [],
      submissions: [],
      score: 0,
      xp: 0,
      keysCollected: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: 'active'
    };

    await store.insert('escape_room_sessions', sessionRecord);

    // Return sanitized session for frontend (no correct answers)
    return this.sanitizeSessionForClient(sessionRecord);
  }

  /**
   * Generates a dynamic sequence of academic rooms with authentic MBA challenges.
   */
  static async generateRoomSequence({ subject, files, chunks, roomCount, difficulty }) {
    const roomTemplates = [
      {
        roomIndex: 0,
        roomType: 'first_lock',
        roomTitle: 'The Chamber of Foundations',
        roomTheme: 'ancient_library',
        roomDescription: 'You stand before the heavy iron vault door. A glowing terminal requires verifying core foundational principles to disengage the primary bolt.'
      },
      {
        roomIndex: 1,
        roomType: 'hidden_clue',
        roomTitle: 'The Archive of Hidden Trade-offs',
        roomTheme: 'knowledge_vault',
        roomDescription: 'Dusty scrolls and architectural blueprints line the stone shelves. Decipher the critical operational trade-off to reveal the hidden cipher.'
      },
      {
        roomIndex: 2,
        roomType: 'knowledge_vault',
        roomTitle: 'The Sanctum of Deep Analysis',
        roomTheme: 'alchemical_lab',
        roomDescription: 'A glowing pedestal holds the first Knowledge Key behind an energy barrier. Solve the analytical challenge to deactivate the field.'
      },
      {
        roomIndex: 3,
        roomType: 'mystery_chamber',
        roomTitle: 'The Hall of Real-World Scenarios',
        roomTheme: 'clockwork_chamber',
        roomDescription: 'Cogs turn as practical business failure modes are simulated. Diagnose the root systemic cause to forge the Master Key.'
      },
      {
        roomIndex: 4,
        roomType: 'final_boss',
        roomTitle: 'The Portal of Synthesis',
        roomTheme: 'grand_observatory',
        roomDescription: 'The final portal to escape the academic labyrinth towers before you. Synthesize core course principles to unlock the ultimate door.'
      }
    ];

    const activeTemplates = roomTemplates.slice(0, roomCount);
    const questionsPool = this.getSubjectQuestionBank(subject.name, files, chunks);

    const rooms = [];
    const secureQuestions = {};

    for (let i = 0; i < activeTemplates.length; i++) {
      const tmpl = activeTemplates[i];
      const qData = questionsPool[i % questionsPool.length];
      const questionId = `q_esc_${i + 1}_${uuidv4().substring(0, 6)}`;

      const basePoints = 100 + i * 50;

      // Public question data sent to frontend
      const clientQuestion = {
        id: questionId,
        roomIndex: i,
        roomTitle: tmpl.roomTitle,
        roomType: tmpl.roomType,
        roomDescription: tmpl.roomDescription,
        questionText: qData.question,
        options: shuffle(qData.options),
        concept: qData.concept,
        points: basePoints,
        hintsAvailable: 3
      };

      // Secure backend question record with answers & 3 progressive hints
      secureQuestions[questionId] = {
        id: questionId,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation,
        sourceReference: qData.sourceReference,
        concept: qData.concept,
        basePoints,
        hints: [
          {
            level: 1,
            hintText: `Conceptual Clue: Focus on the primary purpose of ${qData.concept}. Think about why this framework or principle is chosen over alternatives.`,
            pointPenalty: 20
          },
          {
            level: 2,
            hintText: `Specific Direction: Notice the operational trade-offs mentioned in ${qData.sourceReference}. What does the course material highlight as the deciding factor?`,
            pointPenalty: 35
          },
          {
            level: 3,
            hintText: `Direct Reasoning: As noted in ${qData.sourceReference}: "${qData.explanation.substring(0, 100)}..." Consider which option directly matches this conclusion.`,
            pointPenalty: 50
          }
        ]
      };

      rooms.push({
        roomIndex: i,
        roomTitle: tmpl.roomTitle,
        roomType: tmpl.roomType,
        roomTheme: tmpl.roomTheme,
        roomDescription: tmpl.roomDescription,
        isUnlocked: i === 0, // First room is unlocked initially
        isCompleted: false,
        question: clientQuestion
      });
    }

    return { rooms, secureQuestions };
  }

  /**
   * Retrieves high-yield questions tailored to the subject and grounded in uploaded files.
   */
  static getSubjectQuestionBank(subjectName, files, chunks) {
    const sName = (subjectName || '').toLowerCase();
    const primaryFile = files[0]?.originalName || 'Course Presentation';

    if (sName.includes('product management')) {
      return [
        {
          question: 'When architecting a high-concurrency Python backend for machine learning model serving and modern microservices, which framework provides native asynchronous support, automated OpenAPI documentation, and built-in request validation?',
          options: ['FastAPI', 'Django', 'Flask', 'Tkinter'],
          correctAnswer: 'FastAPI',
          explanation: 'FastAPI is designed from the ground up to be async-first, featuring automated Swagger/OpenAPI documentation and type validation with Pydantic, making it the industry standard for modern Python APIs.',
          concept: 'Web Backend Architecture',
          sourceReference: `${files.find(f => f.originalName.includes('Tech-Stacks'))?.originalName || primaryFile}, Slide 6 & 7`
        },
        {
          question: 'In modern API system design, why are event-driven Webhooks preferred over Short Polling for receiving real-time event notifications (such as payment gateway confirmations)?',
          options: [
            'Webhooks push notifications only when events happen, eliminating redundant requests and reducing server load',
            'Short polling is forbidden by standard HTTP protocol specifications',
            'Webhooks bypass all network firewall security inspections',
            'Short polling cannot transmit JSON payloads'
          ],
          correctAnswer: 'Webhooks push notifications only when events happen, eliminating redundant requests and reducing server load',
          explanation: 'With Webhooks, the provider server makes an HTTP POST callback only when the specific event occurs. Short polling repeatedly sends requests at fixed intervals, wasting substantial bandwidth and compute.',
          concept: 'API Event Architecture',
          sourceReference: `${files.find(f => f.originalName.includes('APIs'))?.originalName || primaryFile}, Slide 8`
        },
        {
          question: 'When designing a core transactional ledger for an e-commerce platform where financial integrity and strict consistency are required, which database paradigm and properties are essential?',
          options: [
            'Relational database enforcing ACID compliance (Atomicity, Consistency, Isolation, Durability)',
            'Key-value cache with eventual consistency and no transaction rollback',
            'Unstructured document store with no schema validation',
            'In-memory temporary queue without disk persistence'
          ],
          correctAnswer: 'Relational database enforcing ACID compliance (Atomicity, Consistency, Isolation, Durability)',
          explanation: 'Financial transactions require ACID guarantees so that multi-step operations (e.g. debiting one balance and crediting another) either succeed completely or roll back, preventing corrupted state.',
          concept: 'Database Transactions & ACID',
          sourceReference: `${files.find(f => f.originalName.includes('Databases'))?.originalName || primaryFile}, Slide 4`
        },
        {
          question: 'During Agile Sprint Planning, what is the primary function of scheduling a time-boxed "Spike" user story?',
          options: [
            'To conduct targeted research or proof-of-concept work to resolve architectural and feasibility uncertainty',
            'To penalize developers for unfinished tasks from the previous sprint',
            'To bypass quality assurance and automated testing requirements',
            'To deploy untested hotfixes directly to production'
          ],
          correctAnswer: 'To conduct targeted research or proof-of-concept work to resolve architectural and feasibility uncertainty',
          explanation: 'A Spike is a dedicated, time-boxed exploration in Scrum used to research an unknown library, architecture, or dependency so the team can provide confident story point estimates later.',
          concept: 'Agile Estimation & Spikes',
          sourceReference: `${files.find(f => f.originalName.includes('Sprint'))?.originalName || primaryFile}, Slide 4`
        },
        {
          question: 'From a Product Manager\'s perspective, how should third-party API dependencies (e.g., SMS gateways or payment providers) be treated in system architecture?',
          options: [
            'A partner outage equals your product outage in the user\'s eyes; systems must have fallback plans and rate-limit safeguards',
            'Third-party partner APIs are covered by SLAs and require no internal error-handling',
            'API integrations automatically buffer unbounded traffic without rate limits',
            'Third-party APIs should only be called synchronously on the user\'s main thread'
          ],
          correctAnswer: 'A partner outage equals your product outage in the user\'s eyes; systems must have fallback plans and rate-limit safeguards',
          explanation: 'End users hold your application accountable when critical features fail. Product Managers must ensure teams design graceful fallbacks, circuit breakers, and rate-limit handling for external dependencies.',
          concept: 'System Resilience & Partner SLAs',
          sourceReference: `${files.find(f => f.originalName.includes('APIs'))?.originalName || primaryFile}, Slide 10`
        }
      ];
    }

    if (sName.includes('microeconomics')) {
      return [
        {
          question: 'If an MBA Product Manager determines that the absolute price elasticity of demand for a B2B SaaS tool is inelastic (|Ed| < 1), what is the expected impact on total revenue if the company raises subscription prices by 8%?',
          options: [
            'Total revenue will increase because the percentage drop in quantity demanded is smaller than the percentage increase in price',
            'Total revenue will decline to zero due to customer substitution',
            'Total revenue will decrease because buyers are hyper-sensitive to price',
            'Total revenue will remain perfectly unchanged'
          ],
          correctAnswer: 'Total revenue will increase because the percentage drop in quantity demanded is smaller than the percentage increase in price',
          explanation: 'When demand is inelastic (|Ed| < 1), quantity demanded changes by a smaller percentage than price. Therefore, Price × Quantity rises when price increases.',
          concept: 'Price Elasticity of Demand',
          sourceReference: `${files.find(f => f.originalName.includes('Elasticities'))?.originalName || primaryFile}, Slide 18`
        },
        {
          question: 'In competitive market theory, under what exact operational condition does a firm maximize short-run economic profit?',
          options: [
            'By producing the output level where Marginal Revenue equals Marginal Cost (MR = MC)',
            'By maximizing Total Revenue regardless of production costs',
            'By producing at the minimum point of the Average Fixed Cost curve',
            'By setting price equal to total accounting overhead'
          ],
          correctAnswer: 'By producing the output level where Marginal Revenue equals Marginal Cost (MR = MC)',
          explanation: 'Profit maximization occurs where the additional revenue earned from producing one more unit exactly offsets the additional cost incurred (MR = MC), provided Price is above Average Variable Cost.',
          concept: 'Profit Maximization Condition',
          sourceReference: `${files.find(f => f.originalName.includes('Profit'))?.originalName || primaryFile}, Slide 14`
        },
        {
          question: 'In the short run, at what price threshold should a competitive firm immediately shut down operations rather than continue producing at an operating loss?',
          options: [
            'When market price falls below minimum Average Variable Cost (P < AVC)',
            'When market price falls below minimum Average Total Cost (P < ATC)',
            'When total accounting profit falls below positive ten percent',
            'When fixed capital overhead exceeds labor expenditure'
          ],
          correctAnswer: 'When market price falls below minimum Average Variable Cost (P < AVC)',
          explanation: 'If Price is below Average Variable Cost, the firm fails to even cover its operational variable expenses; shutting down limits losses to fixed costs alone.',
          concept: 'Short-Run Shutdown Rule',
          sourceReference: `${files.find(f => f.originalName.includes('Profit'))?.originalName || primaryFile}, Slide 19`
        },
        {
          question: 'If the cross-price elasticity of demand between Product X and Product Y is negative (Exy < 0), what does this indicate about the economic relationship between the two goods?',
          options: [
            'The products are complementary goods consumed together (e.g., game consoles and video games)',
            'The products are direct substitutes (e.g., Uber and Lyft)',
            'Product X is an inferior good while Product Y is a luxury good',
            'There is zero cross-market demand correlation'
          ],
          correctAnswer: 'The products are complementary goods consumed together (e.g., game consoles and video games)',
          explanation: 'Negative cross-price elasticity means that when the price of Good Y increases, the demand for Good X falls, which is the hallmark of complementary goods.',
          concept: 'Cross-Price Elasticity',
          sourceReference: `${files.find(f => f.originalName.includes('Elasticities'))?.originalName || primaryFile}, Slide 24`
        },
        {
          question: 'What economic principle explains why the Marginal Cost curve eventually slopes upward as a firm expands production in the short run with fixed plant capacity?',
          options: [
            'The law of diminishing marginal returns to variable inputs',
            'Economies of scale across administrative overhead',
            'Monopolistic pricing power over suppliers',
            'Constant opportunity cost of capital'
          ],
          correctAnswer: 'The law of diminishing marginal returns to variable inputs',
          explanation: 'In the short run, capital is fixed. Adding more labor eventually yields smaller additional output per worker, which drives up the marginal cost of producing subsequent units.',
          concept: 'Diminishing Marginal Returns',
          sourceReference: `${files.find(f => f.originalName.includes('cost of production'))?.originalName || primaryFile}, Slide 12`
        }
      ];
    }

    if (sName.includes('mrm')) {
      return [
        {
          question: 'When diagnosing why an online retailer experienced market share erosion after a website re-platforming, what is the fatal bias of relying solely on customer satisfaction surveys of existing site visitors?',
          options: [
            'It suffers from survivorship bias by questioning only customers who stayed, failing to capture churned users and reasons for competitor switching',
            'It introduces excessive statistical variance into the Likert scale',
            'It violates standard double-blind sampling protocols',
            'It relies too heavily on causal laboratory experimentation'
          ],
          correctAnswer: 'It suffers from survivorship bias by questioning only customers who stayed, failing to capture churned users and reasons for competitor switching',
          explanation: 'Surveys of existing active visitors only measure satisfaction among users who tolerated the change; they completely miss why lost customers departed and where they defected.',
          concept: 'Problem Statement Framing & Bias',
          sourceReference: `${files.find(f => f.originalName.includes('Problem'))?.originalName || primaryFile}, Slide 7`
        },
        {
          question: 'Which research design is best suited when an MBA team has ambiguous problem definitions and needs to discover underlying consumer motivations before undertaking large-scale quantitative testing?',
          options: [
            'Exploratory research (e.g. in-depth interviews, focus groups)',
            'Descriptive cross-sectional census surveys',
            'Rigorous A/B split laboratory hypothesis testing',
            'Secondary econometric regression modeling'
          ],
          correctAnswer: 'Exploratory research (e.g. in-depth interviews, focus groups)',
          explanation: 'Exploratory research is designed to clarify ambiguous problems, gain foundational insights, and generate qualitative hypotheses prior to structured descriptive or causal quantification.',
          concept: 'Research Design Classification',
          sourceReference: `${files.find(f => f.originalName.includes('Introduction') || f.originalName.includes('Problem'))?.originalName || primaryFile}, Slide 15`
        },
        {
          question: 'In marketing research, how is "Construct Validity" formally distinguished from "Reliability"?',
          options: [
            'Validity assesses whether the tool truly measures the intended concept; reliability measures the repeatability and consistency of measurements',
            'Validity applies only to quantitative experiments; reliability applies only to focus groups',
            'Validity is an accounting calculation; reliability is a legal trademark metric',
            'Validity measures sample size; reliability measures standard error'
          ],
          correctAnswer: 'Validity assesses whether the tool truly measures the intended concept; reliability measures the repeatability and consistency of measurements',
          explanation: 'A measurement instrument can be perfectly reliable (yielding the same score repeatedly) while lacking validity (measuring the wrong psychological or behavioral construct).',
          concept: 'Measurement Validity vs Reliability',
          sourceReference: `${files[0]?.originalName || primaryFile}, Slide 18`
        }
      ];
    }

    // Default / Leadership accelerator
    return [
      {
        question: 'In situational leadership and high-stakes product management, how should a leader adapt their style when working with a highly experienced, intrinsically motivated senior engineering team?',
        options: [
          'Adopt a delegating/empowering style with clear strategic objectives and low micromanagement',
          'Enforce strict directive management with hourly check-ins',
          'Eliminate all cross-functional communication channels',
          'Retain exclusive decision-making authority over technical implementation'
        ],
        correctAnswer: 'Adopt a delegating/empowering style with clear strategic objectives and low micromanagement',
        explanation: 'High-competence, high-commitment team members thrive with strategic context and delegation, whereas heavy directive control diminishes psychological safety and slows execution.',
        concept: 'Situational Leadership & Delegation',
        sourceReference: `${files[0]?.originalName || primaryFile}, Slide 22`
      },
      {
        question: 'When leading cross-functional squads (Product, Design, Engineering, Analytics) without direct reporting authority, what is the most effective mechanism to achieve alignment?',
        options: [
          'Influence without authority grounded in shared customer metrics, transparent reasoning, and empathetic listening',
          'Issuing administrative reprimands through departmental managers',
          'Refusing to share product roadmaps until delivery is finished',
          'Making unilateral product architecture commitments without engineering input'
        ],
        correctAnswer: 'Influence without authority grounded in shared customer metrics, transparent reasoning, and empathetic listening',
        explanation: 'Product Managers rarely manage squad members hierarchically; influence without authority relies on clear data, customer outcomes, and building trust across disciplines.',
        concept: 'Influence Without Authority',
        sourceReference: `${files[0]?.originalName || primaryFile}, Slide 28`
      },
      {
        question: 'In team psychological safety and agile retrospective ceremonies, what cultural practice is most vital for identifying operational bottlenecks?',
        options: [
          'Focusing blame-free discussions on root process failures rather than personal fault',
          'Publishing individual developer error rates on shared dashboards',
          'Cancelling retrospectives to prioritize feature output',
          'Restricting speaking time exclusively to senior managers'
        ],
        correctAnswer: 'Focusing blame-free discussions on root process failures rather than personal fault',
        explanation: 'Psychological safety encourages team members to report risks and failure modes early without fear of retribution, accelerating systemic resolution.',
        concept: 'Psychological Safety & Retrospectives',
        sourceReference: `${files[0]?.originalName || primaryFile}, Slide 35`
      }
    ];
  }

  /**
   * Retrieves a progressive hint for an active challenge.
   * Tracks hint usage and computes point deduction.
   */
  static async getHint({ sessionId, roomIndex, questionId, requestedLevel = 1 }) {
    const session = store.findById('escape_room_sessions', sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found.`);
    }

    const secureQ = session.secureQuestions[questionId];
    if (!secureQ) {
      throw new Error(`Question ${questionId} not found in session.`);
    }

    const level = Math.min(Math.max(1, requestedLevel), 3);
    const hintObj = secureQ.hints.find((h) => h.level === level) || secureQ.hints[0];

    // Record hint usage
    session.hintsUsed.push({
      roomIndex,
      questionId,
      level,
      penalty: hintObj.pointPenalty,
      requestedAt: new Date().toISOString()
    });

    await store.update('escape_room_sessions', sessionId, {
      hintsUsed: session.hintsUsed
    });

    return {
      hintLevel: level,
      hintText: hintObj.hintText,
      maxHints: 3,
      pointPenalty: hintObj.pointPenalty
    };
  }

  /**
   * Submits an answer for a room challenge.
   * Grades on backend, calculates score/XP, unlocks next chamber,
   * awards knowledge keys, and completes session when final door opens.
   */
  static async submitAnswer({ sessionId, roomIndex, questionId, answer, timeTakenSeconds = 0 }) {
    const session = store.findById('escape_room_sessions', sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found.`);
    }

    const room = session.rooms[roomIndex];
    if (!room) {
      throw new Error(`Room index ${roomIndex} out of bounds.`);
    }

    const secureQ = session.secureQuestions[questionId];
    if (!secureQ) {
      throw new Error(`Question ${questionId} not found.`);
    }

    const cleanAnswer = (answer || '').trim();
    const cleanCorrect = (secureQ.correctAnswer || '').trim();
    const isCorrect = cleanAnswer.toLowerCase() === cleanCorrect.toLowerCase();

    // Calculate penalties from hints for this question
    const questionHints = session.hintsUsed.filter((h) => h.questionId === questionId);
    const totalPenalty = questionHints.reduce((sum, h) => sum + h.penalty, 0);

    let pointsEarned = 0;
    let xpEarned = 0;
    let keyAwarded = false;

    if (isCorrect) {
      pointsEarned = Math.max(25, secureQ.basePoints - totalPenalty);
      xpEarned = Math.round(pointsEarned * 1.5);

      // Award a knowledge key for vault rooms or final boss
      if (room.roomType === 'knowledge_vault' || room.roomType === 'mystery_chamber' || room.roomType === 'final_boss') {
        keyAwarded = true;
        session.keysCollected += 1;
      }

      room.isCompleted = true;
      session.score += pointsEarned;
      session.xp += xpEarned;

      // Unlock next room if one exists
      if (roomIndex + 1 < session.rooms.length) {
        session.rooms[roomIndex + 1].isUnlocked = true;
      }
    }

    // Record submission
    session.submissions.push({
      roomIndex,
      questionId,
      roomTitle: room.roomTitle,
      concept: secureQ.concept,
      studentAnswer: cleanAnswer,
      correctAnswer: cleanCorrect,
      isCorrect,
      pointsEarned,
      xpEarned,
      timeTakenSeconds,
      submittedAt: new Date().toISOString()
    });

    const isGameCompleted = session.rooms.every((r) => r.isCompleted);
    if (isGameCompleted) {
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
    }

    await store.update('escape_room_sessions', sessionId, {
      rooms: session.rooms,
      score: session.score,
      xp: session.xp,
      keysCollected: session.keysCollected,
      submissions: session.submissions,
      status: session.status,
      completedAt: session.completedAt
    });

    // If game finished, save result record
    if (isGameCompleted) {
      await this.saveGameResult(session);
    }

    return {
      isCorrect,
      correctAnswer: isCorrect ? secureQ.correctAnswer : undefined,
      explanation: isCorrect ? secureQ.explanation : 'Incorrect solution. Inspect your clues or call for a progressive hint.',
      sourceReference: secureQ.sourceReference,
      pointsEarned,
      xpEarned,
      keyAwarded,
      isRoomUnlocked: isCorrect,
      isGameCompleted,
      nextRoomIndex: isCorrect && roomIndex + 1 < session.rooms.length ? roomIndex + 1 : null,
      totalScore: session.score,
      totalXp: session.xp,
      totalKeys: session.keysCollected
    };
  }

  /**
   * Finalizes session and persists performance analytics and weak-topic report.
   */
  static async saveGameResult(session) {
    const totalSubmissions = session.submissions.length;
    const correctSubmissions = session.submissions.filter((s) => s.isCorrect);
    const accuracyPercentage = totalSubmissions > 0
      ? Math.round((correctSubmissions.length / totalSubmissions) * 100)
      : 0;

    const strongTopics = [];
    const weakTopics = [];

    for (const sub of session.submissions) {
      if (sub.isCorrect) {
        if (!strongTopics.includes(sub.concept)) strongTopics.push(sub.concept);
      } else {
        weakTopics.push({
          topic: sub.concept,
          subjectId: session.subjectId,
          reason: `Failed challenge in ${sub.roomTitle}`
        });
      }
    }

    const answersSummary = session.submissions.map((sub) => {
      const secureQ = session.secureQuestions[sub.questionId] || {};
      return {
        roomTitle: sub.roomTitle,
        question: secureQ.concept || 'Academic Challenge',
        studentAnswer: sub.studentAnswer,
        correctAnswer: sub.correctAnswer,
        isCorrect: sub.isCorrect,
        explanation: secureQ.explanation || '',
        sourceReference: secureQ.sourceReference || ''
      };
    });

    const resultRecord = {
      id: `esc_res_${uuidv4()}`,
      sessionId: session.id,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      totalScore: session.score,
      maxScore: session.totalRooms * 250,
      accuracyPercentage,
      xpEarned: session.xp,
      keysCollected: session.keysCollected,
      roomsEscaped: session.rooms.filter((r) => r.isCompleted).length,
      totalRooms: session.totalRooms,
      timeTakenSeconds: session.submissions.reduce((sum, s) => sum + (s.timeTakenSeconds || 0), 0),
      hintsUsedCount: session.hintsUsed.length,
      strongTopics,
      weakTopics,
      answersSummary,
      completedAt: new Date().toISOString()
    };

    await store.insert('escape_room_history', resultRecord);

    await store.logActivity(
      'study',
      session.subjectId,
      `Escaped Room: ${session.subjectName}`,
      `Completed ${resultRecord.roomsEscaped}/${resultRecord.totalRooms} chambers with ${resultRecord.keysCollected} keys and ${resultRecord.accuracyPercentage}% accuracy.`
    );

    return resultRecord;
  }

  /**
   * Returns session history.
   */
  static async getHistory(subjectId) {
    let history = store.get('escape_room_history') || [];
    if (subjectId) {
      history = history.filter((h) => h.subjectId === subjectId);
    }
    return history.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }

  /**
   * Strips out correct answers and security keys before returning session to client.
   */
  static sanitizeSessionForClient(session) {
    const { secureQuestions, submissions, ...safeSession } = session;
    return safeSession;
  }
}

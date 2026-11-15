export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  fileCount?: number;
  topicCount?: number;
  studiedCount?: number;
  understoodCount?: number;
  revisionCount?: number;
  quizCount?: number;
  attemptsCount?: number;
  progressPercent?: number;
}

export interface CourseFile {
  id: string;
  subjectId: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  error: string | null;
  slideCount: number | null;
  pageCount: number | null;
  chunkCount: number;
  createdAt: string;
}

export interface Unit {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  createdAt: string;
}

export type TopicStatus = 'not_started' | 'in_progress' | 'studied' | 'understood' | 'needs_revision';

export interface Topic {
  id: string;
  subjectId: string;
  unitId: string | null;
  name: string;
  status: TopicStatus;
  order: number;
  lastStudiedAt: string | null;
  createdAt: string;
}

export interface Chunk {
  id: string;
  fileId: string;
  subjectId: string;
  fileName: string;
  slideNumber: number | null;
  pageNumber: number | null;
  heading: string | null;
  content: string;
  tokenCount: number;
  createdAt: string;
  relevanceScore?: number;
}

export interface Citation {
  fileId: string;
  fileName: string;
  slideNumber: number | null;
  pageNumber: number | null;
  heading: string | null;
}

export interface StudyNote {
  id: string;
  subjectId: string;
  fileId: string | null;
  title: string;
  content: string;
  references: Citation[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'fill_blanks' | 'conceptual' | 'case_based';
  difficulty: 'easy' | 'medium' | 'difficult';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  concept: string;
  sourceReference: string;
}

export interface Quiz {
  id: string;
  subjectId: string;
  fileId: string | null;
  topicId: string | null;
  title: string;
  difficulty: string;
  questionTypes: string[];
  timeLimit: number;
  mode: 'practice' | 'test';
  questionCount: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface AnswerEvaluation {
  questionId: string;
  question: string;
  type: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  scoreEarned: number;
  explanation: string;
  sourceReference: string;
  concept: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  subjectId: string;
  topicId: string | null;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  answers: AnswerEvaluation[];
  weakConcepts: { concept: string; total: number; correct: number }[];
  strongConcepts: { concept: string; total: number; correct: number }[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  fileId: string | null;
  topicId: string | null;
  front: string;
  back: string;
  concept: string;
  sourceReference: string;
  status: 'new' | 'learning' | 'known' | 'difficult';
  reviewCount: number;
  lastReviewedAt: string | null;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string | null;
  topicId: string | null;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'upload' | 'study' | 'quiz' | 'flashcard' | 'note' | 'task' | 'subject' | 'file';
  subjectId: string | null;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ProgressOverview {
  overall: {
    totalSubjects: number;
    totalFiles: number;
    totalTopics: number;
    notStartedTopics: number;
    inProgressTopics: number;
    studiedTopics: number;
    understoodTopics: number;
    revisionTopics: number;
    quizzesCompleted: number;
    avgQuizScore: number;
    overallMasteryPercent: number;
  };
  subjectProgress: {
    id: string;
    name: string;
    color: string;
    icon: string;
    totalTopics: number;
    studiedTopics: number;
    understoodTopics: number;
    revisionTopics: number;
    fileCount: number;
    completionPercent: number;
    averageQuizScore: number | null;
    quizAttemptsCount: number;
    flashcardCount: number;
  }[];
  weakTopics: {
    topicId: string | null;
    topicName: string;
    subjectId: string;
    subjectName: string;
    reason: string;
    accuracy: number | null;
    priority: string;
  }[];
  recentActivities: ActivityLog[];
}

export interface AppSettings {
  aiProvider: 'gemini' | 'openai';
  model: string;
  defaultExplanationMode: 'eli15' | 'detailed' | 'exam';
  studyReminder: boolean;
  theme: string;
  hasGeminiKey: boolean;
  hasOpenaiKey: boolean;
  maskedGeminiKey: string;
  maskedOpenaiKey: string;
}

// ==========================================
// THE EXAM ESCAPE ROOM TYPES
// ==========================================

export type EscapeRoomDifficulty = 'easy' | 'medium' | 'hard' | 'adaptive';
export type EscapeRoomDuration = 5 | 10 | 15 | 0; // 0 = no timer
export type RoomType =
  | 'first_lock'
  | 'hidden_clue'
  | 'knowledge_vault'
  | 'mystery_chamber'
  | 'final_boss';

export interface EscapeRoomQuestionClient {
  id: string;
  roomIndex: number;
  roomTitle: string;
  roomType: RoomType;
  roomDescription: string;
  questionText: string;
  options: string[];
  concept: string;
  points: number;
  hintsAvailable: number;
}

export interface EscapeRoomRoomClient {
  roomIndex: number;
  roomTitle: string;
  roomType: RoomType;
  roomTheme: string;
  roomDescription: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  question: EscapeRoomQuestionClient;
}

export interface EscapeRoomSessionClient {
  id: string;
  subjectId: string;
  subjectName: string;
  difficulty: EscapeRoomDifficulty;
  durationMinutes: number;
  totalRooms: number;
  currentRoomIndex: number;
  rooms: EscapeRoomRoomClient[];
  keysCollected: number;
  score: number;
  xp: number;
  startedAt: string;
  status: 'active' | 'completed' | 'failed';
}

export interface EscapeRoomHintResponse {
  hintLevel: number;
  hintText: string;
  maxHints: number;
  pointPenalty: number;
}

export interface EscapeRoomSubmitResponse {
  isCorrect: boolean;
  correctAnswer?: string;
  explanation: string;
  sourceReference: string;
  pointsEarned: number;
  xpEarned: number;
  keyAwarded: boolean;
  isRoomUnlocked: boolean;
  isGameCompleted: boolean;
  nextRoomIndex: number | null;
  totalScore: number;
  totalXp: number;
  totalKeys: number;
}

export interface EscapeRoomResult {
  id: string;
  sessionId: string;
  subjectId: string;
  subjectName: string;
  totalScore: number;
  maxScore: number;
  accuracyPercentage: number;
  xpEarned: number;
  keysCollected: number;
  roomsEscaped: number;
  totalRooms: number;
  timeTakenSeconds: number;
  hintsUsedCount: number;
  strongTopics: string[];
  weakTopics: {
    topic: string;
    subjectId: string;
    fileId?: string;
    reason: string;
  }[];
  answersSummary: {
    roomTitle: string;
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    sourceReference: string;
  }[];
  completedAt: string;
}

export interface EscapeRoomLobbyInfo {
  subjects: {
    id: string;
    name: string;
    color: string;
    fileCount: number;
    chunkCount: number;
    estimatedRooms: number;
    isReady: boolean;
    reason?: string;
  }[];
  recentAttempts: EscapeRoomResult[];
}

// ==========================================
// ✨ ONE-CLICK VISUAL NOTES TYPES
// ==========================================

export type VisualFormat = 'mindmap' | 'infographic' | 'process' | 'revisionsheet';

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string; // pastel color e.g. 'lavender' | 'pink' | 'mint' | 'yellow' | 'blue' | 'peach' | 'lilac'
  badge?: string;
  slideReference?: string;
  children?: MindMapNode[];
}

export interface InfographicItem {
  title: string;
  text: string;
  stat?: string;
  formula?: string;
  example?: string;
  icon?: string;
  badge?: string;
  slideReference?: string;
}

export interface InfographicSection {
  id: string;
  title: string;
  tagline?: string;
  color: string;
  items: InfographicItem[];
}

export interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  stageColor: string;
  isDecisionPoint?: boolean;
  decisionQuestion?: string;
  yesBranch?: string;
  noBranch?: string;
  keyTakeaway: string;
  slideReference?: string;
}

export interface RevisionSection {
  id: string;
  category: 'definition' | 'formula' | 'comparison' | 'framework' | 'takeaway';
  title: string;
  color: string;
  content: string;
  formula?: string;
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  memoryCue?: string;
  examTip?: string;
  slideReference?: string;
}

export interface VisualNote {
  id: string;
  fileId: string;
  fileName: string;
  subjectId: string;
  subjectName: string;
  format: VisualFormat;
  title: string;
  subtitle: string;
  summary: string;
  slideCount: number;
  coveragePercentage: number;
  verifiedSlides: number[];
  mindMapData?: {
    root: MindMapNode;
  };
  infographicData?: {
    sections: InfographicSection[];
    keyStats: { label: string; value: string; icon?: string }[];
  };
  processData?: {
    title: string;
    description: string;
    steps: ProcessStep[];
  };
  revisionSheetData?: {
    sections: RevisionSection[];
    keyFormulas: { formula: string; explanation: string; whenToUse: string }[];
    examCheatSheet: string[];
  };
  createdAt: string;
}



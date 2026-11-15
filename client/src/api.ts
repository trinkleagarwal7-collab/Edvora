import {
  Subject,
  CourseFile,
  Unit,
  Topic,
  Chunk,
  StudyNote,
  Quiz,
  QuizAttempt,
  Flashcard,
  StudyTask,
  ProgressOverview,
  AppSettings
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Subjects
  getSubjects: () => fetchJson<Subject[]>('/subjects'),
  getSubject: (id: string) =>
    fetchJson<{
      subject: Subject;
      files: CourseFile[];
      units: Unit[];
      topics: Topic[];
      quizzes: Quiz[];
      flashcards: Flashcard[];
      notes: StudyNote[];
      recentActivity: any[];
      stats: any;
    }>(`/subjects/${id}`),
  createSubject: (data: { name: string; description?: string; color?: string; icon?: string }) =>
    fetchJson<Subject>('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id: string, data: Partial<Subject>) =>
    fetchJson<Subject>(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/subjects/${id}`, { method: 'DELETE' }),

  // Units & Topics
  createUnit: (subjectId: string, data: { name: string; order?: number }) =>
    fetchJson<Unit>(`/subjects/${subjectId}/units`, { method: 'POST', body: JSON.stringify(data) }),
  createTopic: (subjectId: string, data: { name: string; unitId?: string | null; order?: number }) =>
    fetchJson<Topic>(`/subjects/${subjectId}/topics`, { method: 'POST', body: JSON.stringify(data) }),
  updateTopic: (topicId: string, data: { status?: string; name?: string; unitId?: string | null }) =>
    fetchJson<Topic>(`/subjects/topics/${topicId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTopic: (topicId: string) =>
    fetchJson<{ success: boolean }>(`/subjects/topics/${topicId}`, { method: 'DELETE' }),

  // Files & Upload
  uploadFiles: async (subjectId: string, files: File[]) => {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    const res = await fetch(`${API_BASE}/files/upload/${subjectId}`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Failed to upload files.');
    }
    return res.json();
  },
  getFilePreview: (fileId: string) =>
    fetchJson<{ file: CourseFile; chunks: Chunk[] }>(`/files/${fileId}/preview`),
  reprocessFile: (fileId: string) =>
    fetchJson<{ success: boolean; file: CourseFile; chunkCount: number }>(`/files/${fileId}/reprocess`, {
      method: 'POST'
    }),
  deleteFile: (fileId: string) =>
    fetchJson<{ success: boolean; message: string }>(`/files/${fileId}`, { method: 'DELETE' }),

  // AI Study Room
  askAi: (data: {
    query: string;
    mode?: 'eli15' | 'detailed' | 'exam';
    scope?: {
      subjectId?: string | null;
      fileId?: string | null;
      slideNumber?: number | null;
      slideRange?: { start: number; end: number } | null;
      pageNumber?: number | null;
    };
    conversationId?: string | null;
  }) =>
    fetchJson<{
      answer: string;
      citations: any[];
      visualContent: string | null;
      visualType: string | null;
      mode: string;
      isGrounded: boolean;
      apiKeyNotice?: string;
      conversationId?: string;
    }>('/ai/ask', { method: 'POST', body: JSON.stringify(data) }),

  generateNotes: (data: { subjectId: string; fileId?: string | null; topicName?: string }) =>
    fetchJson<StudyNote>('/ai/notes', { method: 'POST', body: JSON.stringify(data) }),
  getNotes: (subjectId?: string) =>
    fetchJson<StudyNote[]>(`/ai/notes${subjectId ? `?subjectId=${subjectId}` : ''}`),
  updateNote: (id: string, data: { title?: string; content?: string }) =>
    fetchJson<StudyNote>(`/ai/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) => fetchJson<{ success: boolean }>(`/ai/notes/${id}`, { method: 'DELETE' }),

  // Quizzes & Practice
  generateQuiz: (data: {
    subjectId: string;
    fileId?: string | null;
    topicId?: string | null;
    topicName?: string;
    questionCount?: number;
    difficulty?: string;
    questionTypes?: string[];
    timeLimit?: number;
    mode?: 'practice' | 'test';
  }) => fetchJson<Quiz>('/quizzes/generate', { method: 'POST', body: JSON.stringify(data) }),
  getQuiz: (id: string) => fetchJson<Quiz>(`/quizzes/${id}`),
  submitQuiz: (id: string, data: { answers: { questionId: string; answer: string }[]; timeTaken?: number }) =>
    fetchJson<QuizAttempt>(`/quizzes/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  getQuizHistory: (subjectId?: string) =>
    fetchJson<QuizAttempt[]>(`/quizzes/history/all${subjectId ? `?subjectId=${subjectId}` : ''}`),

  // Flashcards
  generateFlashcards: (data: { subjectId: string; fileId?: string | null; topicId?: string | null; count?: number }) =>
    fetchJson<Flashcard[]>('/flashcards/generate', { method: 'POST', body: JSON.stringify(data) }),
  getFlashcards: (subjectId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (status) params.append('status', status);
    return fetchJson<Flashcard[]>(`/flashcards?${params.toString()}`);
  },
  reviewFlashcard: (id: string, status: 'known' | 'difficult' | 'learning') =>
    fetchJson<Flashcard>(`/flashcards/${id}/review`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteFlashcard: (id: string) =>
    fetchJson<{ success: boolean }>(`/flashcards/${id}`, { method: 'DELETE' }),

  // Progress & Analytics
  getProgressOverview: () => fetchJson<ProgressOverview>('/progress/overview'),

  // Study Planner
  getStudyTasks: (subjectId?: string) =>
    fetchJson<StudyTask[]>(`/planner${subjectId ? `?subjectId=${subjectId}` : ''}`),
  createStudyTask: (data: {
    title: string;
    subjectId?: string | null;
    topicId?: string | null;
    targetDate?: string;
    priority?: string;
  }) => fetchJson<StudyTask>('/planner', { method: 'POST', body: JSON.stringify(data) }),
  updateStudyTask: (id: string, data: Partial<StudyTask>) =>
    fetchJson<StudyTask>(`/planner/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStudyTask: (id: string) =>
    fetchJson<{ success: boolean }>(`/planner/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => fetchJson<AppSettings>('/settings'),
  updateSettings: (data: Partial<AppSettings> & { geminiApiKey?: string; openaiApiKey?: string }) =>
    fetchJson<{ success: boolean; message: string }>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  testApiKey: (data: { provider: 'gemini' | 'openai'; key?: string }) =>
    fetchJson<{ success: boolean; message?: string; error?: string }>('/settings/test-key', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Search
  searchGlobal: (query: string) => fetchJson<any>(`/search?q=${encodeURIComponent(query)}`),

  // Exam Escape Room
  getEscapeRoomLobby: () => fetchJson<import('./types').EscapeRoomLobbyInfo>('/escape-room/lobby'),
  startEscapeRoom: (data: {
    subjectId: string;
    difficulty: import('./types').EscapeRoomDifficulty;
    durationMinutes: number;
    preferredRoomCount?: number;
  }) =>
    fetchJson<import('./types').EscapeRoomSessionClient>('/escape-room/session/start', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  submitEscapeRoomAnswer: (
    sessionId: string,
    data: {
      roomIndex: number;
      questionId: string;
      answer: string;
      timeTakenSeconds: number;
    }
  ) =>
    fetchJson<import('./types').EscapeRoomSubmitResponse>(`/escape-room/session/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getEscapeRoomHint: (
    sessionId: string,
    data: {
      roomIndex: number;
      questionId: string;
      requestedLevel: number;
    }
  ) =>
    fetchJson<import('./types').EscapeRoomHintResponse>(`/escape-room/session/${sessionId}/hint`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getEscapeRoomHistory: (subjectId?: string) =>
    fetchJson<import('./types').EscapeRoomResult[]>(
      `/escape-room/history${subjectId ? `?subjectId=${subjectId}` : ''}`
    ),

  // ✨ One-Click Visual Notes
  generateVisualNotes: (data: { fileId: string; format: import('./types').VisualFormat }) =>
    fetchJson<import('./types').VisualNote>('/ai/visual-notes/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getVisualNote: (fileId: string, format?: import('./types').VisualFormat) =>
    fetchJson<import('./types').VisualNote | null>(
      `/ai/visual-notes/${fileId}${format ? `?format=${format}` : ''}`
    )
};

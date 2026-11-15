import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Layers,
  FileText,
  Zap,
  Repeat,
  Trophy,
  History,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api';
import { Subject, CourseFile, Quiz, QuizAttempt, Flashcard, StudyNote } from '../../types';
import { StudyNotesRenderer } from '../../components/common/StudyNotesRenderer';

interface PracticePageProps {
  initialSubjectId?: string | null;
  initialFileId?: string | null;
  initialTab?: string;
  onNavigateToStudyRoom: (context: any) => void;
  onNavigateToCourses: () => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({
  initialSubjectId = null,
  initialFileId = null,
  initialTab = 'quizzes',
  onNavigateToStudyRoom,
  onNavigateToCourses
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(initialSubjectId);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(initialFileId || null);

  // Active Screen: 'options' | 'quiz' | 'flashcards' | 'revision' | 'history'
  const [viewState, setViewState] = useState<'options' | 'quiz' | 'flashcards' | 'revision' | 'history'>('options');

  // Quiz state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // Quick Revision state
  const [revisionNote, setRevisionNote] = useState<StudyNote | null>(null);
  const [isLoadingRevision, setIsLoadingRevision] = useState(false);

  // History state
  const [attemptsHistory, setAttemptsHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialSubjectId]);

  useEffect(() => {
    if (initialFileId) {
      setSelectedFileId(initialFileId);
    }
  }, [initialFileId]);

  useEffect(() => {
    if (initialTab === 'revision') {
      setViewState('revision');
    } else if (initialTab === 'flashcards') {
      setViewState('flashcards');
    }
  }, [initialTab]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadFiles(selectedSubjectId);
      loadFlashcards(selectedSubjectId);
      loadHistory(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  // Quiz Timer
  useEffect(() => {
    if (!activeQuiz || quizResult || activeQuiz.mode !== 'test') return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, quizResult]);

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const loadFiles = async (subjId: string) => {
    try {
      const data = await api.getSubject(subjId);
      setFiles(data.files || []);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const loadFlashcards = async (subjId: string) => {
    try {
      const cards = await api.getFlashcards(subjId);
      setFlashcards(cards);
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    }
  };

  const loadHistory = async (subjId: string) => {
    try {
      const hist = await api.getQuizHistory(subjId);
      setAttemptsHistory(hist);
    } catch (err) {
      console.error('Failed to load quiz history:', err);
    }
  };

  // Launch pre-configured quiz mode
  const handleStartMode = async (
    modeType: 'quick' | 'chapter' | 'difficult' | 'exam'
  ) => {
    if (!selectedSubjectId) return;

    setIsGenerating(true);
    setQuizResult(null);
    setActiveQuiz(null);

    let count = 5;
    let diff = 'medium';
    let testMode: 'test' | 'practice' = 'practice';
    let limit = 10;

    if (modeType === 'quick') {
      count = 3;
      diff = 'easy';
      testMode = 'practice';
    } else if (modeType === 'chapter') {
      count = 10;
      diff = 'medium';
      testMode = 'practice';
    } else if (modeType === 'difficult') {
      count = 5;
      diff = 'difficult';
      testMode = 'practice';
    } else if (modeType === 'exam') {
      count = 10;
      diff = 'mixed';
      testMode = 'test';
      limit = 15;
    }

    try {
      const quiz = await api.generateQuiz({
        subjectId: selectedSubjectId,
        fileId: selectedFileId,
        questionCount: count,
        difficulty: diff,
        timeLimit: limit,
        mode: testMode
      });
      setActiveQuiz(quiz);
      setCurrentQuestionIdx(0);
      setUserAnswers({});
      setTimeRemaining(limit * 60);
      setViewState('quiz');
    } catch (err: any) {
      alert(`Quiz notice: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const answersPayload = Object.entries(userAnswers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const elapsed = activeQuiz.timeLimit * 60 - timeRemaining;
      const result = await api.submitQuiz(activeQuiz.id, {
        answers: answersPayload,
        timeTaken: Math.max(1, elapsed)
      });

      setQuizResult(result);
      if (result.percentage >= 70) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
      if (selectedSubjectId) loadHistory(selectedSubjectId);
    } catch (err: any) {
      alert(`Evaluation error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedSubjectId) return;
    setIsGeneratingCards(true);
    try {
      const newCards = await api.generateFlashcards({
        subjectId: selectedSubjectId,
        fileId: selectedFileId,
        count: 8
      });
      setFlashcards(newCards);
      setCurrentCardIdx(0);
      setIsCardFlipped(false);
    } catch (err: any) {
      alert(`Flashcard notice: ${err.message}`);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleReviewFlashcard = async (status: 'known' | 'difficult') => {
    if (flashcards.length === 0) return;
    const card = flashcards[currentCardIdx];
    try {
      await api.reviewFlashcard(card.id, status);
      setIsCardFlipped(false);
      if (currentCardIdx < flashcards.length - 1) {
        setCurrentCardIdx(currentCardIdx + 1);
      }
    } catch (err) {
      console.error('Failed to review card:', err);
    }
  };

  const handleOpenQuickRevision = async () => {
    if (!selectedSubjectId) return;
    setViewState('revision');
    setIsLoadingRevision(true);
    try {
      const note = await api.generateNotes({
        subjectId: selectedSubjectId,
        fileId: selectedFileId || undefined
      });
      setRevisionNote(note);
    } catch (err: any) {
      console.error('Revision load error:', err);
    } finally {
      setIsLoadingRevision(false);
    }
  };

  if (subjects.length === 0) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-3xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600 mx-auto shadow-soft">
          <CheckSquare className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold text-charcoal-900 tracking-tight">No Materials to Practice Yet</h3>
        <p className="text-xs md:text-sm text-charcoal-500 max-w-sm mx-auto leading-relaxed">
          Edvora generates quizzes and flashcards strictly from your uploaded lecture notes. Upload course materials to begin.
        </p>
        <button
          onClick={onNavigateToCourses}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-all shadow-md active:scale-98"
        >
          <span>Go to My Courses</span>
        </button>
      </div>
    );
  }

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const selectedFile = files.find((f) => f.id === selectedFileId);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200 font-sans">
      {/* Scope Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-cream-200/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
              Course:
            </label>
            <select
              value={activeSubject.id}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedFileId(null);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-cream-300 bg-white text-xs font-bold text-charcoal-900 outline-hidden focus:border-brand-500 shadow-2xs cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
              Material:
            </label>
            <select
              value={selectedFileId || 'all'}
              onChange={(e) => setSelectedFileId(e.target.value === 'all' ? null : e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-cream-300 bg-white text-xs font-bold text-charcoal-900 outline-hidden focus:border-brand-500 max-w-[280px] truncate shadow-2xs cursor-pointer"
            >
              <option value="all">📚 All Materials in Course ({files.length} files)</option>
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  📄 {f.originalName} {f.slideCount ? `(${f.slideCount} slides)` : f.pageCount ? `(${f.pageCount} pages)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {viewState !== 'options' && (
          <button
            onClick={() => {
              setViewState('options');
              setActiveQuiz(null);
              setQuizResult(null);
            }}
            className="text-xs font-bold text-charcoal-500 hover:text-charcoal-900 flex items-center gap-1.5 self-start md:self-auto bg-white px-3 py-1.5 rounded-xl border border-cream-300 shadow-2xs transition-colors"
          >
            <span>← Back to Practice Modes</span>
          </button>
        )}
      </div>

      {/* VIEW 1: PRACTICE LANDING (3 Core Pillars: Quick Quiz, Flashcards, Quick Revision) */}
      {viewState === 'options' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-charcoal-900 tracking-tight">
              Practice & Revision
            </h2>

            {selectedFile ? (
              <div className="p-4 rounded-2xl bg-brand-50/90 border border-brand-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5 text-brand-900 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-brand-200 flex items-center justify-center text-brand-700 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium truncate">
                    Testing on: <strong className="text-charcoal-900">{selectedFile.originalName}</strong> {selectedFile.slideCount ? `(${selectedFile.slideCount} slides)` : ''}. Questions & 4 options derived strictly from this presentation.
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFileId(null)}
                  className="text-xs font-bold text-brand-700 hover:text-brand-900 underline shrink-0"
                >
                  Test All Materials
                </button>
              </div>
            ) : (
              <p className="text-xs md:text-sm text-charcoal-500">
                Select your revision mode for <strong>{activeSubject.name}</strong> ({files.length} uploaded materials).
              </p>
            )}
          </div>

          {/* 3 Core Interactive Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode 1: Quick Quiz */}
            <div
              onClick={() => handleStartMode('quick')}
              className="p-6 rounded-3xl bg-white border border-cream-300 hover:border-brand-300 shadow-soft card-hover cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200/60 shadow-2xs group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-2.5 py-0.5 rounded-full">
                    3 Questions
                  </span>
                  <h4 className="text-base font-bold text-charcoal-900 group-hover:text-brand-700 transition-colors mt-2">
                    Quick Quiz
                  </h4>
                  <p className="text-xs text-charcoal-500 leading-relaxed mt-1">
                    Fast 3-question MCQ check derived strictly from {selectedFile ? selectedFile.originalName : 'your course lecture slides'}.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-cream-200/70 flex items-center justify-between text-xs font-bold text-brand-700">
                <span>Start Quick Quiz</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Mode 2: Flashcards */}
            <div
              onClick={() => {
                setViewState('flashcards');
                if (flashcards.length === 0) handleGenerateFlashcards();
              }}
              className="p-6 rounded-3xl bg-white border border-cream-300 hover:border-coral-300 shadow-soft card-hover cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-coral-50 text-coral-600 flex items-center justify-center border border-coral-200/60 shadow-2xs group-hover:bg-coral-500 group-hover:text-white transition-colors">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-coral-600 bg-coral-100/70 px-2.5 py-0.5 rounded-full">
                    Spaced Repetition
                  </span>
                  <h4 className="text-base font-bold text-charcoal-900 group-hover:text-coral-600 transition-colors mt-2">
                    3D Flashcards
                  </h4>
                  <p className="text-xs text-charcoal-500 leading-relaxed mt-1">
                    Flip through concept cards to memorize definitions, formulas and frameworks.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-cream-200/70 flex items-center justify-between text-xs font-bold text-coral-600">
                <span>Open Flashcards</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Mode 3: Quick Revision (5-Minute Refresh) */}
            <div
              onClick={handleOpenQuickRevision}
              className="p-6 rounded-3xl bg-white border border-cream-300 hover:border-sage-300 shadow-soft card-hover cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center border border-sage-200/60 shadow-2xs group-hover:bg-sage-600 group-hover:text-white transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage-700 bg-sage-100/70 px-2.5 py-0.5 rounded-full">
                    5-Minute Catchup
                  </span>
                  <h4 className="text-base font-bold text-charcoal-900 group-hover:text-sage-700 transition-colors mt-2">
                    Quick Revision
                  </h4>
                  <p className="text-xs text-charcoal-500 leading-relaxed mt-1">
                    Lightweight concept recap, definitions & trade-offs when you have only 5–10 minutes.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-cream-200/70 flex items-center justify-between text-xs font-bold text-sage-700">
                <span>Start Quick Revision</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Secondary Assessment Formats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Full Chapter Test */}
            <div
              onClick={() => handleStartMode('chapter')}
              className="p-5 rounded-2xl bg-cream-50/70 border border-cream-300 hover:border-cream-400 cursor-pointer transition-all flex items-center justify-between shadow-2xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  10 Questions • Assessment
                </span>
                <h5 className="text-sm font-bold text-charcoal-900">Full Presentation Exam</h5>
                <p className="text-[11px] text-charcoal-500">Comprehensive coverage across all slides in this deck.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400 shrink-0 ml-3" />
            </div>

            {/* Timed Exam Simulation */}
            <div
              onClick={() => handleStartMode('exam')}
              className="p-5 rounded-2xl bg-cream-50/70 border border-cream-300 hover:border-cream-400 cursor-pointer transition-all flex items-center justify-between shadow-2xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-coral-600">
                  15 Minutes • Timed
                </span>
                <h5 className="text-sm font-bold text-charcoal-900">Timed Exam Simulation</h5>
                <p className="text-[11px] text-charcoal-500">Simulate exam conditions with countdown timer.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400 shrink-0 ml-3" />
            </div>
          </div>

          {isGenerating && (
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-800 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span>Generating questions derived strictly from your slides...</span>
            </div>
          )}

          {/* Past Attempts Link */}
          {attemptsHistory.length > 0 && (
            <div className="pt-2 flex justify-between items-center text-xs text-charcoal-400">
              <span>{attemptsHistory.length} quiz attempt{attemptsHistory.length === 1 ? '' : 's'} recorded</span>
              <button
                onClick={() => setViewState('history')}
                className="font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
              >
                <History className="w-3.5 h-3.5" />
                <span>View Quiz History →</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ACTIVE QUIZ */}
      {viewState === 'quiz' && activeQuiz && !quizResult && (
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
                Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
              </span>
              <h3 className="text-sm md:text-base font-bold text-charcoal-900 mt-1.5">{activeQuiz.title}</h3>
            </div>

            {activeQuiz.mode === 'test' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-coral-50 border border-coral-200 font-mono text-xs font-bold text-coral-700">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(timeRemaining / 60)}:
                  {String(timeRemaining % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Active Question */}
          {(() => {
            const q = activeQuiz.questions[currentQuestionIdx];
            const currentAnswer = userAnswers[q.id] || '';

            return (
              <div className="space-y-4">
                <p className="text-sm md:text-base font-bold text-charcoal-900 leading-relaxed whitespace-pre-line">
                  {q.question}
                </p>

                {q.options && q.options.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    {q.options.map((opt, idx) => {
                      const isSelected = currentAnswer === opt;
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                          className={`w-full p-4 rounded-2xl text-left text-xs md:text-sm font-medium transition-all flex items-center justify-between card-hover ${
                            isSelected
                              ? 'bg-brand-50/90 border-2 border-brand-600 text-brand-950 font-bold shadow-xs'
                              : 'bg-white border border-cream-300 hover:border-brand-200 text-charcoal-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-brand-600 text-white' : 'bg-cream-100 text-charcoal-500'
                              }`}
                            >
                              {letter}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-5 border-t border-cream-200">
            <button
              onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-500 hover:bg-cream-100 disabled:opacity-30"
            >
              Previous
            </button>

            {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrentQuestionIdx(
                    Math.min(activeQuiz.questions.length - 1, currentQuestionIdx + 1)
                  )
                }
                className="px-6 py-2.5 rounded-2xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-colors shadow-xs"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md active:scale-98"
              >
                {isSubmitting ? 'Grading...' : 'Submit Answers'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2B: QUIZ RESULTS */}
      {quizResult && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-cream-300 shadow-soft text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
              <Trophy className="w-7 h-7" />
            </div>
            <span className="text-3xl md:text-4xl font-extrabold text-charcoal-900 block">{quizResult.percentage}%</span>
            <h3 className="text-base md:text-lg font-bold text-charcoal-900">
              {quizResult.percentage >= 80 ? 'Well done! Great mastery.' : 'Review your mistakes below'}
            </h3>
            <p className="text-xs text-charcoal-500">
              You scored {quizResult.score} of {quizResult.maxScore} questions correctly.
            </p>

            <div className="pt-3 flex justify-center gap-3">
              <button
                onClick={() => {
                  setQuizResult(null);
                  setActiveQuiz(null);
                  setViewState('options');
                }}
                className="px-5 py-2.5 rounded-2xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-colors"
              >
                Back to Modes
              </button>
              <button
                onClick={() => onNavigateToStudyRoom({ subjectId: activeSubject.id })}
                className="px-5 py-2.5 rounded-2xl bg-cream-100 text-charcoal-900 text-xs font-bold hover:bg-cream-200 border border-cream-300 transition-colors"
              >
                Ask AI Tutor
              </button>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="p-5 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-4 divide-y divide-cream-200/70">
            {quizResult.answers.map((ans, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal-900">Question {idx + 1}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      ans.isCorrect ? 'text-sage-700 bg-sage-50' : 'text-rose-600 bg-rose-50'
                    }`}
                  >
                    {ans.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                <p className="text-charcoal-800 font-semibold">{ans.question}</p>
                {!ans.isCorrect && (
                  <p className="text-sage-700 font-bold bg-sage-50 p-2 rounded-xl">
                    Expected answer: {ans.correctAnswer}
                  </p>
                )}
                <p className="text-charcoal-500 text-[11px] leading-relaxed">{ans.explanation}</p>
                <p className="text-[10px] text-brand-700 font-mono font-semibold">Source: {ans.sourceReference}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: 3D FLASHCARDS */}
      {viewState === 'flashcards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-charcoal-900">Spaced Repetition Flashcards</h3>
              <p className="text-xs text-charcoal-500">Tap the card to flip and reveal the definition.</p>
            </div>

            <button
              onClick={handleGenerateFlashcards}
              disabled={isGeneratingCards}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-white px-3.5 py-1.5 rounded-xl border border-cream-300 shadow-2xs"
            >
              {isGeneratingCards ? 'Generating...' : '+ Generate 8 Cards'}
            </button>
          </div>

          {flashcards.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-cream-300 text-xs text-charcoal-400 space-y-2">
              <p className="font-bold text-charcoal-700">No flashcards generated yet</p>
              <p>Click "+ Generate 8 Cards" above to extract cards from your lecture slides.</p>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-5">
              <div className="text-center text-xs font-bold text-charcoal-400">
                Card {currentCardIdx + 1} of {flashcards.length}
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="w-full h-72 cursor-pointer perspective-1000 select-none"
              >
                <div
                  className={`relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d shadow-soft border border-cream-300 ${
                    isCardFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-white flex flex-col justify-between backface-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-md">
                        {flashcards[currentCardIdx].concept || 'Concept'}
                      </span>
                      <span className="text-[11px] text-charcoal-400 font-medium">Click to flip ↻</span>
                    </div>

                    <div className="my-auto text-center">
                      <h4 className="text-base md:text-lg font-bold text-charcoal-900 leading-relaxed">
                        {flashcards[currentCardIdx].front}
                      </h4>
                    </div>

                    <p className="text-[10px] text-charcoal-400 text-center font-mono">
                      {flashcards[currentCardIdx].sourceReference}
                    </p>
                  </div>

                  {/* BACK FACE */}
                  <div className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-gradient-to-br from-brand-50 to-cream-50 flex flex-col justify-between backface-hidden rotate-y-180 border border-brand-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sage-700 uppercase tracking-wider bg-sage-50 px-2 py-0.5 rounded-md">
                        Answer & Definition
                      </span>
                      <span className="text-[11px] text-brand-600 font-medium">Click to flip ↻</span>
                    </div>

                    <div className="my-auto text-center">
                      <p className="text-xs md:text-sm text-charcoal-800 leading-relaxed font-medium">
                        {flashcards[currentCardIdx].back}
                      </p>
                    </div>

                    <p className="text-[10px] text-charcoal-400 text-center font-mono">
                      {flashcards[currentCardIdx].sourceReference}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation & Status Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleReviewFlashcard('difficult')}
                  className="px-4 py-2 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 border border-cream-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Still Learning</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsCardFlipped(false);
                      setCurrentCardIdx(Math.max(0, currentCardIdx - 1));
                    }}
                    disabled={currentCardIdx === 0}
                    className="p-2 rounded-xl text-charcoal-500 hover:bg-cream-200 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      setIsCardFlipped(false);
                      setCurrentCardIdx(Math.min(flashcards.length - 1, currentCardIdx + 1));
                    }}
                    disabled={currentCardIdx === flashcards.length - 1}
                    className="p-2 rounded-xl text-charcoal-500 hover:bg-cream-200 disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => handleReviewFlashcard('known')}
                  className="px-4 py-2 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-sage-400" />
                  <span>Mastered It</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: QUICK REVISION (5-Minute Catchup Experience) */}
      {viewState === 'revision' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage-50 border border-sage-200 text-sage-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Zap className="w-3 h-3 text-sage-600" />
                <span>5-Minute Quick Revision</span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-charcoal-900">
                {selectedFile ? selectedFile.originalName : activeSubject.name} — High-Yield Catchup
              </h3>
            </div>

            <button
              onClick={() => handleStartMode('quick')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Test Knowledge</span>
            </button>
          </div>

          {isLoadingRevision ? (
            <div className="p-16 flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="w-8 h-8 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-charcoal-400">Synthesizing 5-minute revision notes...</p>
            </div>
          ) : revisionNote ? (
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-cream-300 shadow-soft space-y-5">
              <StudyNotesRenderer content={revisionNote.content} />
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-white border border-cream-300 text-xs text-charcoal-400">
              Select a course or material above to generate instant 5-minute revision notes.
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: QUIZ HISTORY */}
      {viewState === 'history' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-charcoal-900">Assessment History</h3>
          {attemptsHistory.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white border border-cream-300 text-xs text-charcoal-400">
              No quiz attempts recorded yet.
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-white border border-cream-300 shadow-soft divide-y divide-cream-200/70">
              {attemptsHistory.map((att) => (
                <div key={att.id} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-charcoal-900">{att.title}</h5>
                    <p className="text-[11px] text-charcoal-400">
                      Scored {att.score}/{att.maxScore} questions ({att.percentage}%) • Time: {Math.round(att.timeTaken)}s
                    </p>
                  </div>
                  <span
                    className={`font-bold px-2.5 py-1 rounded-xl text-xs ${
                      att.percentage >= 80
                        ? 'bg-sage-50 text-sage-700'
                        : att.percentage >= 60
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {att.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

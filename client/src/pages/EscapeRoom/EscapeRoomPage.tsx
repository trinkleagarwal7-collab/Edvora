import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Clock,
  Shield,
  Zap,
  Award,
  ArrowRight,
  Check,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Box,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { api } from '../../api';
import {
  EscapeRoomDifficulty,
  EscapeRoomDuration,
  EscapeRoomSessionClient,
  EscapeRoomResult,
  EscapeRoomHintResponse,
  EscapeRoomSubmitResponse
} from '../../types';
import { EscapeRoomLobby } from './EscapeRoomLobby';
import { EscapeRoom3DView } from './EscapeRoom3DView';
import { EscapeRoom2DFallback } from './EscapeRoom2DFallback';
import { EscapeRoomResults } from './EscapeRoomResults';

interface EscapeRoomPageProps {
  onNavigateToStudyRoom: (context: { subjectId: string; topicName?: string; fileId?: string }) => void;
  onNavigateToCourses: () => void;
}

export const EscapeRoomPage: React.FC<EscapeRoomPageProps> = ({
  onNavigateToStudyRoom,
  onNavigateToCourses
}) => {
  const [viewState, setViewState] = useState<'lobby' | 'game' | 'results'>('lobby');
  const [activeSession, setActiveSession] = useState<EscapeRoomSessionClient | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const [activeResult, setActiveResult] = useState<EscapeRoomResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // 3D vs 2D mode
  const [is3DMode, setIs3DMode] = useState<boolean>(true);

  // Modals inside the game
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isDeskOpen, setIsDeskOpen] = useState<boolean>(false);

  // Question answering state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<EscapeRoomSubmitResponse | null>(null);

  // Hints state
  const [activeHint, setActiveHint] = useState<EscapeRoomHintResponse | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  // Timer state
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);

  // Start game session from lobby
  const handleStartGame = async (params: {
    subjectId: string;
    difficulty: EscapeRoomDifficulty;
    durationMinutes: number;
    preferredRoomCount?: number;
  }) => {
    setIsStarting(true);
    try {
      const session = await api.startEscapeRoom(params);
      setActiveSession(session);
      setCurrentRoomIndex(0);
      setTimeRemainingSeconds(params.durationMinutes > 0 ? params.durationMinutes * 60 : 0);
      setSubmissionFeedback(null);
      setActiveHint(null);
      setSelectedOption('');
      setViewState('game');
      // Automatically open terminal on first chamber to welcome the student
      setTimeout(() => setIsTerminalOpen(true), 600);
    } catch (err: any) {
      alert(`Escape Room Notice: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  // Timer tick
  useEffect(() => {
    if (viewState !== 'game' || !activeSession || activeSession.durationMinutes === 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewState, activeSession]);

  const handleTimeExpired = () => {
    alert('Time has expired for this escape challenge! Revealing chamber debrief.');
    handleFinishGameEarly();
  };

  const currentRoom = activeSession ? activeSession.rooms[currentRoomIndex] : null;

  // Submit challenge answer
  const handleSubmitAnswer = async () => {
    if (!activeSession || !currentRoom || !selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitEscapeRoomAnswer(activeSession.id, {
        roomIndex: currentRoomIndex,
        questionId: currentRoom.question.id,
        answer: selectedOption,
        timeTakenSeconds: 15
      });

      setSubmissionFeedback(res);

      // Update local session state
      setActiveSession((prev) => {
        if (!prev) return null;
        const updatedRooms = [...prev.rooms];
        if (res.isCorrect) {
          updatedRooms[currentRoomIndex].isCompleted = true;
          if (res.nextRoomIndex !== null && res.nextRoomIndex < updatedRooms.length) {
            updatedRooms[res.nextRoomIndex].isUnlocked = true;
          }
        }
        return {
          ...prev,
          rooms: updatedRooms,
          score: res.totalScore,
          xp: res.totalXp,
          keysCollected: res.totalKeys
        };
      });
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request a progressive hint
  const handleRequestHint = async (level: number) => {
    if (!activeSession || !currentRoom || isLoadingHint) return;

    setIsLoadingHint(true);
    try {
      const hint = await api.getEscapeRoomHint(activeSession.id, {
        roomIndex: currentRoomIndex,
        questionId: currentRoom.question.id,
        requestedLevel: level
      });
      setActiveHint(hint);
    } catch (err: any) {
      alert(`Hint notice: ${err.message}`);
    } finally {
      setIsLoadingHint(false);
    }
  };

  // Advance to next unlocked room
  const handleAdvanceToNextRoom = () => {
    if (!activeSession) return;

    if (submissionFeedback?.isGameCompleted) {
      handleLoadResults();
      return;
    }

    if (currentRoomIndex + 1 < activeSession.rooms.length) {
      setCurrentRoomIndex(currentRoomIndex + 1);
      setSelectedOption('');
      setSubmissionFeedback(null);
      setActiveHint(null);
      setIsTerminalOpen(true);
    }
  };

  // Load final game result
  const handleLoadResults = async () => {
    if (!activeSession) return;
    try {
      const history = await api.getEscapeRoomHistory(activeSession.subjectId);
      const match = history.find((h) => h.sessionId === activeSession.id) || history[0];
      if (match) {
        setActiveResult(match);
      } else {
        // Fallback result representation
        setActiveResult({
          id: `res_${Date.now()}`,
          sessionId: activeSession.id,
          subjectId: activeSession.subjectId,
          subjectName: activeSession.subjectName,
          totalScore: activeSession.score,
          maxScore: activeSession.totalRooms * 250,
          accuracyPercentage: 100,
          xpEarned: activeSession.xp,
          keysCollected: activeSession.keysCollected,
          roomsEscaped: activeSession.rooms.filter((r) => r.isCompleted).length,
          totalRooms: activeSession.totalRooms,
          timeTakenSeconds: 300,
          hintsUsedCount: 0,
          strongTopics: [currentRoom?.question.concept || 'Core Concepts'],
          weakTopics: [],
          answersSummary: [],
          completedAt: new Date().toISOString()
        });
      }
      setIsTerminalOpen(false);
      setViewState('results');
    } catch (err) {
      console.error('Failed to load escape results:', err);
      setViewState('lobby');
    }
  };

  const handleFinishGameEarly = () => {
    handleLoadResults();
  };

  return (
    <div className="min-h-full">
      {/* VIEW 1: LOBBY */}
      {viewState === 'lobby' && (
        <EscapeRoomLobby
          onStartGame={handleStartGame}
          onViewResultDetails={(res) => {
            setActiveResult(res);
            setViewState('results');
          }}
          isStarting={isStarting}
        />
      )}

      {/* VIEW 2: ACTIVE GAME PLAY */}
      {viewState === 'game' && activeSession && currentRoom && (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">
          {/* Top Game HUD Bar */}
          <div className="p-4 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Left: Back & Subject */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (confirm('Leave this escape challenge and return to lobby?')) {
                    setViewState('lobby');
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-charcoal-500 hover:text-charcoal-800 hover:bg-[#F5F2EB] transition-colors"
              >
                ← Exit Chamber
              </button>
              <div className="h-4 w-px bg-[#EBE7DF]" />
              <div>
                <span className="text-[10px] text-charcoal-400 font-bold uppercase tracking-wider block">
                  {activeSession.subjectName}
                </span>
                <span className="text-xs font-bold text-charcoal-900">
                  Room {currentRoomIndex + 1} of {activeSession.totalRooms}
                </span>
              </div>
            </div>

            {/* Middle: Chamber Progress Dots */}
            <div className="flex items-center gap-1.5">
              {activeSession.rooms.map((rm, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (rm.isUnlocked) {
                      setCurrentRoomIndex(idx);
                      setSelectedOption('');
                      setSubmissionFeedback(null);
                      setActiveHint(null);
                    }
                  }}
                  disabled={!rm.isUnlocked}
                  className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center ${
                    idx === currentRoomIndex
                      ? 'bg-brand-600 text-white ring-2 ring-brand-300 shadow-xs'
                      : rm.isCompleted
                      ? 'bg-sage-100 text-sage-800 border border-sage-300'
                      : rm.isUnlocked
                      ? 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-[#EBE7DF]'
                      : 'bg-charcoal-100 text-charcoal-400 opacity-40 cursor-not-allowed'
                  }`}
                  title={`${rm.roomTitle} (${rm.isCompleted ? 'Solved' : rm.isUnlocked ? 'Available' : 'Locked'})`}
                >
                  {rm.isCompleted ? '✓' : idx + 1}
                </button>
              ))}
            </div>

            {/* Right: Timer, Score, Keys HUD */}
            <div className="flex items-center gap-3">
              {activeSession.durationMinutes > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-coral-50 border border-coral-200 text-coral-700 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {Math.floor(timeRemainingSeconds / 60)}:
                    {String(timeRemainingSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <span>🗝️</span>
                <span>{activeSession.keysCollected} Keys</span>
              </div>

              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-brand-600" />
                <span>{activeSession.score} pts</span>
              </div>

              {/* View Toggle */}
              <button
                onClick={() => setIs3DMode(!is3DMode)}
                className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EBE7DF] hover:bg-[#F3EFE6] text-charcoal-700 text-xs font-bold transition-colors"
                title={is3DMode ? 'Switch to 2D view' : 'Switch to 3D view'}
              >
                {is3DMode ? <Box className="w-4 h-4 text-brand-600" /> : <ImageIcon className="w-4 h-4 text-charcoal-500" />}
              </button>
            </div>
          </div>

          {/* Main 3D / 2D Viewport */}
          {is3DMode ? (
            <EscapeRoom3DView
              currentRoom={currentRoom}
              totalRooms={activeSession.totalRooms}
              keysCollected={activeSession.keysCollected}
              onInteractTerminal={() => setIsTerminalOpen(true)}
              onInteractDoor={() => {
                if (currentRoom.isCompleted) {
                  handleAdvanceToNextRoom();
                } else {
                  setIsTerminalOpen(true);
                }
              }}
              onInteractDesk={() => setIsDeskOpen(true)}
              onFallbackTo2D={() => setIs3DMode(false)}
            />
          ) : (
            <EscapeRoom2DFallback
              currentRoom={currentRoom}
              totalRooms={activeSession.totalRooms}
              keysCollected={activeSession.keysCollected}
              onInteractTerminal={() => setIsTerminalOpen(true)}
              onInteractDoor={() => {
                if (currentRoom.isCompleted) {
                  handleAdvanceToNextRoom();
                } else {
                  setIsTerminalOpen(true);
                }
              }}
              onInteractDesk={() => setIsDeskOpen(true)}
              onSwitchTo3D={() => setIs3DMode(true)}
            />
          )}

          {/* MODAL 1: Holographic Terminal Question Dialog */}
          {isTerminalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EBE7DF] overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="p-5 border-b border-[#F5F2EB] flex items-center justify-between bg-charcoal-900 text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-400/30 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{currentRoom.roomTitle}</h4>
                      <p className="text-[11px] text-charcoal-300">
                        Chamber {currentRoomIndex + 1} • {currentRoom.question.points} Points Available
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTerminalOpen(false)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
                  {/* Lore / Description */}
                  <p className="text-xs text-charcoal-500 italic bg-[#FAF9F5] p-3 rounded-2xl border border-[#EBE7DF]">
                    "{currentRoom.roomDescription}"
                  </p>

                  {/* Question Stem */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                      Academic Challenge
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-charcoal-900 pt-1 leading-relaxed">
                      {currentRoom.question.questionText}
                    </h3>
                  </div>

                  {/* Options */}
                  {!submissionFeedback?.isCorrect && (
                    <div className="space-y-2.5 pt-1">
                      {currentRoom.question.options.map((opt, idx) => {
                        const isSelected = selectedOption === opt;
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedOption(opt)}
                            className={`w-full p-3.5 rounded-2xl text-left text-xs md:text-sm font-medium transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-brand-50 border-2 border-brand-600 text-brand-950 font-bold shadow-xs'
                                : 'bg-[#FAF9F5] border border-[#EBE7DF] hover:border-brand-200 text-charcoal-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-brand-600 text-white' : 'bg-white text-charcoal-500 border border-[#EBE7DF]'
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

                  {/* Progressive Hint Display */}
                  {activeHint && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 animate-in fade-in">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Progressive Hint (Level {activeHint.hintLevel}/3)</span>
                        </span>
                        <span className="text-[10px] text-amber-700">-{activeHint.pointPenalty} pts penalty</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">{activeHint.hintText}</p>
                    </div>
                  )}

                  {/* Submission Feedback & Solved Result */}
                  {submissionFeedback && (
                    <div
                      className={`p-4 rounded-2xl border text-xs space-y-2.5 animate-in fade-in ${
                        submissionFeedback.isCorrect
                          ? 'bg-sage-50 border-sage-200 text-sage-900'
                          : 'bg-coral-50 border-coral-200 text-coral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-sm">
                          {submissionFeedback.isCorrect ? (
                            <>
                              <span>🎉 Chamber Unlocked!</span>
                              {submissionFeedback.keyAwarded && <span className="text-amber-600 font-extrabold">🗝️ Knowledge Key Acquired!</span>}
                            </>
                          ) : (
                            <span>✗ Puzzle Seal Resisted</span>
                          )}
                        </span>
                        <span className="font-bold">
                          {submissionFeedback.isCorrect ? `+${submissionFeedback.pointsEarned} pts` : 'Try again'}
                        </span>
                      </div>

                      <p className="text-[11px] leading-relaxed">{submissionFeedback.explanation}</p>

                      {submissionFeedback.sourceReference && (
                        <p className="text-[10px] font-mono font-semibold text-charcoal-500 pt-1">
                          Source: {submissionFeedback.sourceReference}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 px-6 border-t border-[#F5F2EB] bg-[#FAF9F5] flex items-center justify-between">
                  {/* Hint Button */}
                  {!submissionFeedback?.isCorrect && (
                    <button
                      type="button"
                      onClick={() => handleRequestHint((activeHint?.hintLevel || 0) + 1)}
                      disabled={isLoadingHint || (activeHint?.hintLevel || 0) >= 3}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {(activeHint?.hintLevel || 0) >= 3
                          ? 'All Hints Revealed'
                          : `Reveal Hint ${(activeHint?.hintLevel || 0) + 1} / 3`}
                      </span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsTerminalOpen(false)}
                      className="px-4 py-2 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-[#EBE7DF]/50 transition-colors"
                    >
                      Close
                    </button>

                    {submissionFeedback?.isCorrect ? (
                      <button
                        type="button"
                        onClick={handleAdvanceToNextRoom}
                        className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-98"
                      >
                        <span>
                          {submissionFeedback.isGameCompleted ? 'View Escape Results' : 'Advance to Next Chamber'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption || isSubmitting}
                        className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-98"
                      >
                        {isSubmitting ? 'Verifying...' : 'Submit Solution'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 2: Scholar's Clue Desk Dialog */}
          {isDeskOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EBE7DF] overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EB]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-charcoal-900">Scholar's Clue Parchment</h4>
                      <p className="text-[11px] text-charcoal-400">Historical clues found in {currentRoom.roomTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDeskOpen(false)}
                    className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-charcoal-600 leading-relaxed bg-[#FAF9F5] p-4 rounded-2xl border border-[#EBE7DF]">
                  <p>
                    <strong>Academic Concept Inscribed:</strong> {currentRoom.question.concept}
                  </p>
                  <p>
                    The runes on the chamber walls represent core principles discussed in your MBA lecture notes.
                    Carefully review the options at the central holographic terminal.
                  </p>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                    <strong>Tip:</strong> If you are unsure of the exact specification, you can unlock up to 3 progressive hints directly on the terminal.
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeskOpen(false);
                      setIsTerminalOpen(true);
                    }}
                    className="px-5 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all"
                  >
                    Open Terminal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: RESULTS */}
      {viewState === 'results' && activeResult && (
        <EscapeRoomResults
          result={activeResult}
          onPlayAgain={() => {
            setActiveResult(null);
            setViewState('lobby');
          }}
          onBackToLobby={() => {
            setActiveResult(null);
            setViewState('lobby');
          }}
          onNavigateToStudyRoom={onNavigateToStudyRoom}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Shield,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Trophy,
  History,
  Lock,
  DoorOpen,
  HelpCircle,
  Flame,
  Award
} from 'lucide-react';
import { api } from '../../api';
import {
  EscapeRoomDifficulty,
  EscapeRoomDuration,
  EscapeRoomLobbyInfo,
  EscapeRoomResult
} from '../../types';

interface EscapeRoomLobbyProps {
  onStartGame: (params: {
    subjectId: string;
    difficulty: EscapeRoomDifficulty;
    durationMinutes: number;
    preferredRoomCount?: number;
  }) => void;
  onViewResultDetails: (result: EscapeRoomResult) => void;
  isStarting: boolean;
}

export const EscapeRoomLobby: React.FC<EscapeRoomLobbyProps> = ({
  onStartGame,
  onViewResultDetails,
  isStarting
}) => {
  const [lobbyData, setLobbyData] = useState<EscapeRoomLobbyInfo | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<EscapeRoomDifficulty>('medium');
  const [durationMinutes, setDurationMinutes] = useState<EscapeRoomDuration>(10);
  const [preferredRooms, setPreferredRooms] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLobby();
  }, []);

  const loadLobby = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEscapeRoomLobby();
      setLobbyData(data);
      // Select first ready subject by default
      const firstReady = data.subjects.find((s) => s.isReady);
      if (firstReady) {
        setSelectedSubjectId(firstReady.id);
        setPreferredRooms(firstReady.estimatedRooms);
      } else if (data.subjects.length > 0) {
        setSelectedSubjectId(data.subjects[0].id);
      }
    } catch (err) {
      console.error('Failed to load escape room lobby:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectChange = (subjId: string) => {
    setSelectedSubjectId(subjId);
    const subj = lobbyData?.subjects.find((s) => s.id === subjId);
    if (subj) {
      setPreferredRooms(subj.estimatedRooms);
    }
  };

  const handleStart = () => {
    if (!selectedSubjectId || isStarting) return;
    onStartGame({
      subjectId: selectedSubjectId,
      difficulty,
      durationMinutes,
      preferredRoomCount: preferredRooms
    });
  };

  const selectedSubject = lobbyData?.subjects.find((s) => s.id === selectedSubjectId);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-charcoal-500">Preparing knowledge chambers...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-9 animate-in fade-in duration-200">
      {/* Cinematic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-charcoal-900 text-white p-7 md:p-9 shadow-lg border border-charcoal-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive 3D Academic Challenge</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            The Exam Escape Room
          </h2>

          <p className="text-xs md:text-sm text-charcoal-300 leading-relaxed">
            Enter a virtual knowledge vault where your uploaded MBA course materials become interactive puzzles.
            Solve academic challenges, unlock reinforced doors, discover progressive clues, and collect knowledge keys to escape.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-charcoal-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Strictly Grounded in Your Slides</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Earn Knowledge Keys & XP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-400" />
              <span>3D Interactive & 2D Fallback</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Subject, Difficulty, Duration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Course / Subject */}
          <div className="p-6 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-charcoal-900">Select MBA Course</h3>
              </div>
              <span className="text-[11px] text-charcoal-400">Exclusively from uploaded syllabus</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lobbyData?.subjects.map((subj) => {
                const isSelected = selectedSubjectId === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => handleSubjectChange(subj.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-xs'
                        : 'border-[#EBE7DF] hover:border-brand-200 bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
                          MBA Course
                        </span>
                        {subj.isReady ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sage-50 text-sage-700 text-[10px] font-bold border border-sage-200">
                            <CheckCircle2 className="w-3 h-3 text-sage-600" />
                            <span>{subj.estimatedRooms} Chambers</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-coral-50 text-coral-600 text-[10px] font-bold border border-coral-200">
                            <AlertCircle className="w-3 h-3 text-coral-500" />
                            <span>Needs Notes</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-charcoal-900 line-clamp-1">{subj.name}</h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-2 border-t border-[#EBE7DF]/60">
                      <span>{subj.fileCount} Materials</span>
                      <span>{subj.chunkCount} Slides Indexed</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedSubject && !selectedSubject.isReady && (
              <div className="p-3.5 rounded-2xl bg-coral-50 border border-coral-200 text-xs text-coral-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-coral-600 shrink-0 mt-0.5" />
                <p>{selectedSubject.reason}</p>
              </div>
            )}
          </div>

          {/* Step 2: Difficulty Selection */}
          <div className="p-6 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-charcoal-900">Challenge Difficulty</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'easy', label: 'Easy', desc: 'Foundational concepts' },
                { id: 'medium', label: 'Medium', desc: 'Trade-offs & decisions (Recommended)' },
                { id: 'hard', label: 'Hard', desc: 'Analytical synthesis' },
                { id: 'adaptive', label: 'Adaptive', desc: 'Scales to your streak' }
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id as EscapeRoomDifficulty)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    difficulty === d.id
                      ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500 font-bold'
                      : 'border-[#EBE7DF] hover:border-brand-200 bg-[#FAF9F5]'
                  }`}
                >
                  <div className="text-xs font-bold text-charcoal-900">{d.label}</div>
                  <div className="text-[10px] text-charcoal-500 mt-0.5 leading-tight">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Game Duration */}
          <div className="p-6 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-charcoal-900">Escape Time Limit</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { duration: 5, label: '5 Minutes', desc: 'Rapid sprint' },
                { duration: 10, label: '10 Minutes', desc: 'Standard challenge' },
                { duration: 15, label: '15 Minutes', desc: 'Full exam simulation' },
                { duration: 0, label: 'No Timer', desc: 'Casual exploration' }
              ].map((t) => (
                <button
                  key={t.duration}
                  type="button"
                  onClick={() => setDurationMinutes(t.duration as EscapeRoomDuration)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    durationMinutes === t.duration
                      ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500 font-bold'
                      : 'border-[#EBE7DF] hover:border-brand-200 bg-[#FAF9F5]'
                  }`}
                >
                  <div className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{t.label}</span>
                  </div>
                  <div className="text-[10px] text-charcoal-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chamber Overview & Launch Button */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EB]">
                <h3 className="text-sm font-bold text-charcoal-900">Chamber Sequence</h3>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  {preferredRooms} Rooms
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  {
                    num: '1',
                    name: 'The Chamber of Foundations',
                    desc: 'Core definition challenge to unseal the entry'
                  },
                  {
                    num: '2',
                    name: 'The Archive of Trade-offs',
                    desc: 'Decipher operational trade-offs for hidden clues'
                  },
                  {
                    num: '3',
                    name: 'The Sanctum of Deep Analysis',
                    desc: 'Solve analytical puzzle to earn Knowledge Key #1'
                  },
                  {
                    num: '4',
                    name: 'The Hall of Real-World Scenarios',
                    desc: 'Business scenario challenge for Knowledge Key #2'
                  },
                  {
                    num: '5',
                    name: 'The Portal of Synthesis',
                    desc: 'Comprehensive multi-concept lock for final escape'
                  }
                ]
                  .slice(0, preferredRooms)
                  .map((r) => (
                    <div
                      key={r.num}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EBE7DF]/80"
                    >
                      <div className="w-5 h-5 rounded-lg bg-brand-100 text-brand-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {r.num}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-charcoal-900 truncate">{r.name}</div>
                        <div className="text-[10px] text-charcoal-500 leading-tight mt-0.5">
                          {r.desc}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#F5F2EB] space-y-3">
              <button
                type="button"
                onClick={handleStart}
                disabled={!selectedSubject?.isReady || isStarting}
                className="w-full py-3.5 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isStarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Constructing Vault...</span>
                  </>
                ) : (
                  <>
                    <DoorOpen className="w-4 h-4" />
                    <span>Enter the Escape Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-charcoal-400">
                Correct solutions unlock doors. Progressive hints are available if you get stuck.
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-5 rounded-3xl bg-[#FAF9F5] border border-[#EBE7DF] text-xs text-charcoal-600 space-y-2.5">
            <h4 className="font-bold text-charcoal-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>How the Game Works</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-charcoal-500 leading-relaxed list-disc list-inside">
              <li>Navigate between chambers in 3D or 2D view.</li>
              <li>Click the holographic terminal to view challenge questions.</li>
              <li>3-tier progressive hints are available for every puzzle.</li>
              <li>Collect 2 or more knowledge keys to escape the vault.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Escape Sessions Section */}
      {lobbyData?.recentAttempts && lobbyData.recentAttempts.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-600" />
              <span>Your Escape History</span>
            </h3>
            <span className="text-xs text-charcoal-400">
              {lobbyData.recentAttempts.length} past adventure{lobbyData.recentAttempts.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {lobbyData.recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                onClick={() => onViewResultDetails(attempt)}
                className="p-4 rounded-2xl bg-white border border-[#EBE7DF] hover:border-brand-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold">
                    {attempt.subjectName}
                  </span>
                  <span className="text-xs font-black text-charcoal-900">
                    {attempt.accuracyPercentage}% Escaped
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-1 bg-[#FAF9F5] rounded-xl border border-[#EBE7DF]/70">
                  <div>
                    <span className="block text-[10px] text-charcoal-400">Score</span>
                    <span className="font-bold text-charcoal-900">{attempt.totalScore}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-charcoal-400">Keys</span>
                    <span className="font-bold text-amber-600">🗝️ {attempt.keysCollected}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-charcoal-400">XP</span>
                    <span className="font-bold text-brand-600">+{attempt.xpEarned}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-charcoal-400 pt-1">
                  <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                  <span className="font-bold text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Review Run</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

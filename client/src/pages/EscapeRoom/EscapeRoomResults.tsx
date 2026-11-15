import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FolderOpen
} from 'lucide-react';
import { EscapeRoomResult } from '../../types';

interface EscapeRoomResultsProps {
  result: EscapeRoomResult;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onNavigateToStudyRoom: (context: { subjectId: string; topicName?: string; fileId?: string }) => void;
}

export const EscapeRoomResults: React.FC<EscapeRoomResultsProps> = ({
  result,
  onPlayAgain,
  onBackToLobby,
  onNavigateToStudyRoom
}) => {
  useEffect(() => {
    // Fire celebratory confetti when results load
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // non-critical
    }
  }, []);

  const isEscaped = result.roomsEscaped === result.totalRooms;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Victory Header Card */}
      <div className="p-8 rounded-3xl bg-white border border-[#EBE7DF] shadow-md text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>

        <div className="space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-1">
            {isEscaped ? '🎉 You Successfully Escaped!' : 'Adventure Debrief'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-charcoal-900 tracking-tight">
            {isEscaped
              ? `Chambers Conquered in ${result.subjectName}`
              : `Knowledge Vault: ${result.subjectName}`}
          </h2>
          <p className="text-xs text-charcoal-500 max-w-md mx-auto">
            {isEscaped
              ? 'You unlocked every sealed chamber and escaped with all knowledge keys intact!'
              : 'Good effort navigating the chambers! Review your answers below to sharpen your weak concepts.'}
          </p>
        </div>

        {/* 4 Score Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 max-w-2xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE7DF]">
            <span className="block text-[10px] text-charcoal-400 font-bold uppercase">Final Score</span>
            <span className="text-xl font-black text-charcoal-900">{result.totalScore}</span>
            <span className="block text-[10px] text-charcoal-400">/ {result.maxScore} pts</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE7DF]">
            <span className="block text-[10px] text-charcoal-400 font-bold uppercase">Accuracy</span>
            <span className="text-xl font-black text-brand-600">{result.accuracyPercentage}%</span>
            <span className="block text-[10px] text-charcoal-400">
              {result.roomsEscaped} / {result.totalRooms} Rooms
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE7DF]">
            <span className="block text-[10px] text-charcoal-400 font-bold uppercase">Keys Earned</span>
            <span className="text-xl font-black text-amber-600">🗝️ {result.keysCollected}</span>
            <span className="block text-[10px] text-charcoal-400">Knowledge Keys</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE7DF]">
            <span className="block text-[10px] text-charcoal-400 font-bold uppercase">XP Gained</span>
            <span className="text-xl font-black text-sage-600">+{result.xpEarned}</span>
            <span className="block text-[10px] text-charcoal-400">Study XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={onPlayAgain}
            className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Another Subject</span>
          </button>
          <button
            onClick={onBackToLobby}
            className="px-5 py-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 text-xs font-bold border border-[#EBE7DF] transition-all"
          >
            <span>Back to Lobby</span>
          </button>
        </div>
      </div>

      {/* Weak Topics to Revise Card */}
      {result.weakTopics.length > 0 && (
        <div className="p-6 rounded-3xl bg-coral-50/70 border border-coral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-coral-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-coral-600" />
                <span>Recommended Revision Topics</span>
              </h3>
              <p className="text-xs text-coral-700">
                You faced challenges with these concepts during the escape. Review them with the AI Tutor.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-coral-100 text-coral-800 text-xs font-bold">
              {result.weakTopics.length} Focus Area{result.weakTopics.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {result.weakTopics.map((w, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-coral-200 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900">{w.topic}</h4>
                  <p className="text-[11px] text-coral-600 mt-0.5">{w.reason}</p>
                </div>

                <button
                  onClick={() =>
                    onNavigateToStudyRoom({
                      subjectId: result.subjectId,
                      topicName: w.topic
                    })
                  }
                  className="py-1.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 self-start"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Revise in AI Study Room</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Breakdown by Chamber */}
      <div className="p-6 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F5F2EB]">
          <h3 className="text-sm font-bold text-charcoal-900">Chamber Solutions & Evidence</h3>
          <span className="text-xs text-charcoal-400">Grounded in lecture slides</span>
        </div>

        <div className="space-y-4 divide-y divide-[#F5F2EB]">
          {result.answersSummary.map((ans, idx) => (
            <div key={idx} className="pt-4 first:pt-0 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal-900">{ans.roomTitle}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    ans.isCorrect ? 'text-sage-700 bg-sage-50 border border-sage-200' : 'text-coral-700 bg-coral-50 border border-coral-200'
                  }`}
                >
                  {ans.isCorrect ? '✓ Chamber Unlocked' : '✗ Failed Puzzle'}
                </span>
              </div>

              <p className="text-charcoal-800 font-semibold text-xs leading-relaxed">{ans.question}</p>

              {!ans.isCorrect && (
                <div className="p-2.5 rounded-xl bg-sage-50 border border-sage-200 text-sage-800 font-semibold text-[11px]">
                  Correct Solution: {ans.correctAnswer}
                </div>
              )}

              <p className="text-charcoal-600 text-[11px] leading-relaxed bg-[#FAF9F5] p-3 rounded-xl border border-[#EBE7DF]">
                {ans.explanation}
              </p>

              <div className="flex items-center justify-between text-[10px] text-charcoal-400 pt-1">
                <span className="font-mono text-brand-700 font-semibold">
                  Source: {ans.sourceReference}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

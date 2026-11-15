import React from 'react';
import { X, BookOpen, UploadCloud, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSubject: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onCreateSubject
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EBE7DF] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Graphic Banner */}
        <div className="p-6 bg-cream-100 border-b border-[#EBE7DF] text-charcoal-900 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-[#EBE7DF]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/50 text-xs font-bold text-brand-700 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Welcome to Edvora</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-charcoal-900">
            Your Personal AI-Powered MBA Academic Companion
          </h2>
          <p className="text-xs text-charcoal-500 mt-1.5 leading-relaxed">
            Designed to make learning lighter, clear, and completely grounded in your MBA course presentations.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Edvora starts with a clean academic library. Everything you ask or test is grounded in one rule:
            <strong className="text-charcoal-900 font-bold"> Your uploaded course presentations and documents are the sole source of truth.</strong>
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE7DF]">
              <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-charcoal-900">Add or Select a Course</h4>
                <p className="text-[11px] text-charcoal-500 mt-0.5 leading-normal">
                  Organize your MBA subjects like Product Strategy, Microeconomics, and APIs & Architecture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE7DF]">
              <div className="w-7 h-7 rounded-xl bg-sage-50 text-sage-700 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-charcoal-900">Drop Your Lecture Slides (.pptx & .pdf)</h4>
                <p className="text-[11px] text-charcoal-500 mt-0.5 leading-normal">
                  Upload classroom PPTs. Edvora indexes every slide and syllabus concept with page citations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EBE7DF]">
              <div className="w-7 h-7 rounded-xl bg-coral-50 text-coral-700 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-charcoal-900">Explain, 3D Flashcards & Quizzes</h4>
                <p className="text-[11px] text-charcoal-500 mt-0.5 leading-normal">
                  Get clean bulleted study notes without raw symbols, flip realistic 3D flashcards, and test exam readiness.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 px-6 border-t border-[#F5F2EB] bg-[#FAF9F5] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-bold text-charcoal-500 hover:text-charcoal-800"
          >
            I'll explore first
          </button>
          <button
            onClick={() => {
              onClose();
              onCreateSubject();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

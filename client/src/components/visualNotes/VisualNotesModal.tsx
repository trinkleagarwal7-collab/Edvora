import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Network,
  LayoutTemplate,
  Milestone,
  FileSpreadsheet,
  Check,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { VisualFormat, CourseFile } from '../../types';

interface VisualNotesModalProps {
  file: CourseFile;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (format: VisualFormat) => void;
  isLoading: boolean;
}

interface FormatOption {
  id: VisualFormat;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  previewBadge: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  bestFor: string;
}

export const VisualNotesModal: React.FC<VisualNotesModalProps> = ({
  file,
  isOpen,
  onClose,
  onGenerate,
  isLoading
}) => {
  const [selectedFormat, setSelectedFormat] = useState<VisualFormat>('mindmap');

  if (!isOpen) return null;

  const formats: FormatOption[] = [
    {
      id: 'mindmap',
      title: 'Mind Map',
      tagline: 'Radial Concept Tree',
      description: 'Converts your entire document into structured, colorful branches showing core concepts, subtopics, and relationships.',
      icon: <Network className="w-6 h-6 text-purple-600" />,
      previewBadge: '🧠 Concept Hierarchy',
      bgColor: 'bg-purple-50/70',
      borderColor: 'border-purple-300',
      accentColor: 'from-purple-500 to-indigo-500',
      bestFor: 'Connecting complex theories & seeing the big picture'
    },
    {
      id: 'infographic',
      title: 'Infographic',
      tagline: 'Educational Magazine Page',
      description: 'Transforms slides into an editorial-style infographic with highlighted metrics, formula cards, and case examples.',
      icon: <LayoutTemplate className="w-6 h-6 text-emerald-600" />,
      previewBadge: '📰 Editorial Layout',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-300',
      accentColor: 'from-emerald-500 to-teal-500',
      bestFor: 'Visual memory, key statistics & core frameworks'
    },
    {
      id: 'process',
      title: 'Process Diagram',
      tagline: 'Visual Workflow Pipeline',
      description: 'Extracts sequences, decision points, and operational stages with connected milestone cards and arrows.',
      icon: <Milestone className="w-6 h-6 text-amber-600" />,
      previewBadge: '🔀 Step-by-Step Flow',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-300',
      accentColor: 'from-amber-500 to-orange-500',
      bestFor: 'Decision trees, lifecycles & managerial rules'
    },
    {
      id: 'revisionsheet',
      title: 'Visual Revision Sheet',
      tagline: 'Aesthetic Digital Stationery',
      description: 'Pinterest-style digital handwritten study notes with pastel sticky callouts, formula sheets, and exam tips.',
      icon: <FileSpreadsheet className="w-6 h-6 text-rose-600" />,
      previewBadge: '📝 Exam Cheat Sheet',
      bgColor: 'bg-rose-50/70',
      borderColor: 'border-rose-300',
      accentColor: 'from-rose-500 to-pink-500',
      bestFor: 'High-yield exam prep without opening raw PPTs'
    }
  ];

  const handleStartGeneration = () => {
    onGenerate(selectedFormat);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/50 backdrop-blur-xs font-sans">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-cream-300 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-cream-200 flex items-center justify-between bg-linear-to-r from-purple-50 via-pink-50 to-amber-50">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Visual Notes</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-navy-950 tracking-tight flex items-center gap-2">
              <span>Choose Your Visual Format</span>
            </h3>
            <p className="text-xs text-slate-600">
              Converting: <strong className="text-purple-950">{file.originalName}</strong> {file.slideCount ? `(${file.slideCount} slides)` : file.pageCount ? `(${file.pageCount} pages)` : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-charcoal-400 hover:text-charcoal-800 transition-colors shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Format Cards Grid */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1 bg-cream-50/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formats.map((fmt) => {
              const isSelected = selectedFormat === fmt.id;

              return (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? `${fmt.borderColor} ${fmt.bgColor} shadow-md scale-101 ring-2 ring-purple-400/40`
                      : 'border-slate-200/90 bg-white hover:border-purple-200 hover:shadow-sm'
                  }`}
                >
                  {/* Top Bar with Icon & Selection Indicator */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center shrink-0">
                        {fmt.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-charcoal-400 block">
                          {fmt.tagline}
                        </span>
                        <h4 className="text-base font-black text-navy-950 tracking-tight">
                          {fmt.title}
                        </h4>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-purple-600 text-white shadow-xs' : 'border-2 border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {fmt.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-purple-900 bg-white/80 px-2.5 py-0.5 rounded-lg border border-slate-200/80">
                      {fmt.previewBadge}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {fmt.bestFor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-[11px] text-purple-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>100% Slide Synthesis:</strong> Edvora will process all slides and pages in chronological sequence to ensure zero concepts or formulas are omitted.
            </span>
          </div>
        </div>

        {/* Footer with Generate Action */}
        <div className="p-5 border-t border-cream-200 bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-cream-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleStartGeneration}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-linear-to-r from-purple-600 via-pink-600 to-purple-700 text-white text-xs font-black flex items-center gap-2 hover:opacity-95 transition-all shadow-md active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Reading All Slides & Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Visual Notes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

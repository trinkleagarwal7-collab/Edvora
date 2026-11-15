import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Printer,
  RefreshCw,
  Network,
  LayoutTemplate,
  Milestone,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
  FileText
} from 'lucide-react';
import { VisualNote, VisualFormat } from '../../types';
import { MindMapView } from './MindMapView';
import { InfographicView } from './InfographicView';
import { ProcessDiagramView } from './ProcessDiagramView';
import { RevisionSheetView } from './RevisionSheetView';

interface VisualNotesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  note: VisualNote | null;
  isLoading: boolean;
  onChangeFormat: (format: VisualFormat) => void;
}

export const VisualNotesViewer: React.FC<VisualNotesViewerProps> = ({
  isOpen,
  onClose,
  note,
  isLoading,
  onChangeFormat
}) => {
  if (!isOpen) return null;

  const formats: { id: VisualFormat; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'mindmap',
      label: 'Mind Map',
      icon: <Network className="w-4 h-4" />,
      color: 'hover:text-purple-600'
    },
    {
      id: 'infographic',
      label: 'Infographic',
      icon: <LayoutTemplate className="w-4 h-4" />,
      color: 'hover:text-emerald-600'
    },
    {
      id: 'process',
      label: 'Process Diagram',
      icon: <Milestone className="w-4 h-4" />,
      color: 'hover:text-amber-600'
    },
    {
      id: 'revisionsheet',
      label: 'Revision Sheet',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      color: 'hover:text-rose-600'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-6xl bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto min-h-[90vh] print:m-0 print:border-none print:shadow-none print:min-h-0 print:rounded-none">
        {/* Top Control Bar (Hidden during print) */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
          {/* Title & Metadata */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-base md:text-lg font-black text-navy-950 truncate max-w-md">
                {note?.title || 'Visual Study Notes'}
              </h1>
            </div>
            {note && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="truncate max-w-[200px]">{note.fileName}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {note.coveragePercentage}% Complete ({note.slideCount} Slides Covered)
                </span>
              </div>
            )}
          </div>

          {/* Format Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            {formats.map((fmt) => {
              const isActive = note?.format === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => onChangeFormat(fmt.id)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-navy-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {fmt.icon}
                  <span className="hidden sm:inline">{fmt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Print/Export & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isLoading || !note}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-colors shadow-2xs"
              title="Download or Print as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Note Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-purple-500 via-pink-400 to-amber-300 animate-spin flex items-center justify-center shadow-lg" />
                <Sparkles className="w-7 h-7 text-white absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-navy-950">
                  Synthesizing Visual Study Notes...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Extracting 100% of slides, mapping key concepts, and applying aesthetic digital stationery formatting.
                </p>
              </div>
            </div>
          ) : !note ? (
            <div className="py-24 text-center text-slate-500">
              No visual notes available for this document.
            </div>
          ) : (
            <div>
              {note.format === 'mindmap' && note.mindMapData && (
                <MindMapView data={note.mindMapData} />
              )}
              {note.format === 'infographic' && note.infographicData && (
                <InfographicView data={note.infographicData} />
              )}
              {note.format === 'process' && note.processData && (
                <ProcessDiagramView data={note.processData} />
              )}
              {note.format === 'revisionsheet' && note.revisionSheetData && (
                <RevisionSheetView data={note.revisionSheetData} />
              )}
            </div>
          )}
        </main>

        {/* Footer with Academic Guarantee */}
        <footer className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 print:hidden">
          <div className="flex items-center gap-1.5 text-purple-700 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Edvora Visual Study Engine · Zero Lazy References · 100% Syllabus Preserved</span>
          </div>
          <div>
            Subject: <strong className="text-slate-600">{note?.subjectName || 'MBA Core'}</strong>
          </div>
        </footer>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Sparkles,
  Bookmark,
  Lightbulb,
  CheckCircle2,
  Table as TableIcon,
  HelpCircle,
  FileText
} from 'lucide-react';
import { RevisionSection } from '../../types';

interface RevisionSheetViewProps {
  data: {
    title?: string;
    subtitle?: string;
    summary?: string;
    sections: RevisionSection[];
    keyFormulas?: { formula: string; explanation: string; whenToUse: string }[];
    examCheatSheet?: string[];
  };
}

const cardColors: Record<string, { bg: string; border: string; header: string; text: string; pin: string }> = {
  mint: { bg: 'bg-emerald-50/70', border: 'border-emerald-200', header: 'bg-emerald-200/60 text-emerald-950', text: 'text-emerald-950', pin: 'bg-emerald-500' },
  yellow: { bg: 'bg-amber-50/70', border: 'border-amber-200', header: 'bg-amber-200/60 text-amber-950', text: 'text-amber-950', pin: 'bg-amber-500' },
  lavender: { bg: 'bg-purple-50/70', border: 'border-purple-200', header: 'bg-purple-200/60 text-purple-950', text: 'text-purple-950', pin: 'bg-purple-500' },
  pink: { bg: 'bg-rose-50/70', border: 'border-rose-200', header: 'bg-rose-200/60 text-rose-950', text: 'text-rose-950', pin: 'bg-rose-500' },
  blue: { bg: 'bg-sky-50/70', border: 'border-sky-200', header: 'bg-sky-200/60 text-sky-950', text: 'text-sky-950', pin: 'bg-sky-500' }
};

export const RevisionSheetView: React.FC<RevisionSheetViewProps> = ({ data }) => {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-cream-50 via-white to-purple-50/20 p-6 md:p-10 border border-slate-200 shadow-xl space-y-8 font-sans">
      {/* Aesthetic Digital Stationery Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pb-6 border-b-2 border-dashed border-purple-200">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 text-xs font-black shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AESTHETIC DIGITAL REVISION SHEET</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-navy-950 tracking-tight">
          {data.title || 'Visual Study Guide'}
        </h2>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
          {data.subtitle || data.summary}
        </p>
      </div>

      {/* Concept Sections: Cute Stationery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.sections.map((section, idx) => {
          const theme = cardColors[section.color || 'lavender'] || cardColors.lavender;

          return (
            <div
              key={section.id || idx}
              className={`rounded-3xl border-2 ${theme.border} ${theme.bg} p-6 shadow-sm hover:shadow-md transition-all space-y-3.5 relative overflow-hidden`}
            >
              {/* Cute Digital Pin */}
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${theme.pin} shadow-xs inline-block`} />
              </div>

              {/* Card Category Header */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${theme.header}`}>
                  {section.category}
                </span>
                <h3 className={`text-sm md:text-base font-extrabold ${theme.text} tracking-tight`}>
                  {section.title}
                </h3>
              </div>

              <p className="text-xs md:text-[13px] text-slate-700 leading-relaxed font-normal bg-white/70 p-3.5 rounded-2xl border border-white">
                {section.content}
              </p>

              {/* Highlighted Formula Block */}
              {section.formula && (
                <div className="p-3 rounded-2xl bg-white border border-purple-200 text-purple-950 text-xs font-mono font-bold text-center shadow-sm">
                  ✨ {section.formula}
                </div>
              )}

              {/* Responsive Comparison Table */}
              {section.comparisonTable && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-navy-950 text-[11px]">
                      <tr>
                        {section.comparisonTable.headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-3 py-2 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                      {section.comparisonTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/60">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 align-top font-medium">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Memory Cue / Exam Tip sticky callout */}
              {(section.memoryCue || section.examTip) && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-[11px] font-medium space-y-1">
                  {section.memoryCue && (
                    <div className="flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Memory Cue:</strong> {section.memoryCue}</span>
                    </div>
                  )}
                  {section.examTip && (
                    <div className="flex items-start gap-1.5 text-purple-900">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span><strong>Exam Tip:</strong> {section.examTip}</span>
                    </div>
                  )}
                </div>
              )}

              {section.slideReference && (
                <div className="text-[10px] font-mono text-charcoal-400 text-right">
                  📖 {section.slideReference}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Formula Cheat Sheet & Quick Takeaways */}
      {data.keyFormulas && data.keyFormulas.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 space-y-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-700" />
            <h3 className="text-sm font-black text-purple-950 uppercase tracking-wider">
              Essential Examination Formulas Cheat Sheet
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.keyFormulas.map((f, fIdx) => (
              <div key={fIdx} className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-sm space-y-1.5">
                <div className="text-xs font-mono font-black text-purple-900 bg-purple-50 p-2 rounded-xl text-center">
                  {f.formula}
                </div>
                <p className="text-[11px] text-slate-700 leading-tight">
                  {f.explanation}
                </p>
                <div className="text-[10px] text-purple-600 font-bold">
                  When to use: {f.whenToUse}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Exam Must-Know Checklist */}
      {data.examCheatSheet && data.examCheatSheet.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-navy-950 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>High-Yield Revision Checklist</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
            {data.examCheatSheet.map((tip, tIdx) => (
              <div key={tIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

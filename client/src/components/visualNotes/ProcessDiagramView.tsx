import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Milestone
} from 'lucide-react';
import { ProcessStep } from '../../types';

interface ProcessDiagramViewProps {
  data: {
    title: string;
    description: string;
    steps: ProcessStep[];
  };
}

const stageThemes: Record<string, { bg: string; border: string; circle: string; text: string }> = {
  blue: { bg: 'bg-sky-50/70', border: 'border-sky-300', circle: 'bg-sky-600 text-white', text: 'text-sky-950' },
  lavender: { bg: 'bg-purple-50/70', border: 'border-purple-300', circle: 'bg-purple-600 text-white', text: 'text-purple-950' },
  yellow: { bg: 'bg-amber-50/70', border: 'border-amber-300', circle: 'bg-amber-500 text-white', text: 'text-amber-950' },
  pink: { bg: 'bg-rose-50/70', border: 'border-rose-300', circle: 'bg-rose-500 text-white', text: 'text-rose-950' },
  mint: { bg: 'bg-emerald-50/70', border: 'border-emerald-300', circle: 'bg-emerald-600 text-white', text: 'text-emerald-950' }
};

export const ProcessDiagramView: React.FC<ProcessDiagramViewProps> = ({ data }) => {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white p-6 md:p-10 border border-slate-200 shadow-xl space-y-8 font-sans">
      {/* Title & Process Scope */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
          <Milestone className="w-3.5 h-3.5" />
          <span>SEQUENTIAL DECISION PIPELINE</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-navy-950 tracking-tight">
          {data.title}
        </h2>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
          {data.description}
        </p>
      </div>

      {/* Vertical Pipeline of Connected Steps */}
      <div className="relative space-y-6">
        {data.steps.map((step, idx) => {
          const theme = stageThemes[step.stageColor || 'lavender'] || stageThemes.lavender;
          const isLast = idx === data.steps.length - 1;

          return (
            <div key={idx} className="relative flex flex-col items-center">
              {/* Step Card */}
              <div
                className={`w-full rounded-3xl border-2 ${theme.border} ${theme.bg} p-6 md:p-7 shadow-md space-y-3.5 transition-all hover:shadow-lg`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Numbered Milestone Badge */}
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${theme.circle}`}>
                      {step.stepNumber}
                    </div>
                    <h3 className={`text-sm md:text-base font-extrabold ${theme.text} tracking-tight`}>
                      {step.title}
                    </h3>
                  </div>

                  {step.slideReference && (
                    <span className="text-[11px] font-mono text-charcoal-400 bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-200">
                      📄 {step.slideReference}
                    </span>
                  )}
                </div>

                <p className="text-xs md:text-[13px] text-slate-700 leading-relaxed font-normal bg-white/70 p-3.5 rounded-2xl border border-white">
                  {step.description}
                </p>

                {/* Conditional Decision Diamond if step is a decision point */}
                {step.isDecisionPoint && (
                  <div className="p-4 rounded-2xl bg-amber-100/70 border-2 border-amber-300 space-y-2.5 text-xs text-amber-950 shadow-sm">
                    <div className="flex items-center gap-2 font-black text-amber-900">
                      <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Decision Rule: {step.decisionQuestion}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                      {step.yesBranch && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>If YES:</strong> {step.yesBranch}</span>
                        </div>
                      )}
                      {step.noBranch && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-1.5 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span><strong>If NO:</strong> {step.noBranch}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Takeaway Pill */}
                {step.keyTakeaway && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Managerial Rule: {step.keyTakeaway}</span>
                  </div>
                )}
              </div>

              {/* Connecting Downward Arrow */}
              {!isLast && (
                <div className="my-2 text-purple-400 flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-purple-300" />
                  <ArrowDown className="w-4 h-4 text-purple-500 -mt-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

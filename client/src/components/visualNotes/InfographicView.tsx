import React from 'react';
import {
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { InfographicSection } from '../../types';

interface InfographicViewProps {
  data: {
    title?: string;
    subtitle?: string;
    keyStats?: { label: string; value: string; icon?: string }[];
    sections: InfographicSection[];
  };
}

const colorStyles: Record<string, { cardBg: string; border: string; headerBg: string; titleColor: string; pill: string }> = {
  mint: { cardBg: 'bg-emerald-50/60', border: 'border-emerald-200', headerBg: 'bg-emerald-600', titleColor: 'text-emerald-950', pill: 'bg-emerald-100 text-emerald-800' },
  yellow: { cardBg: 'bg-amber-50/60', border: 'border-amber-200', headerBg: 'bg-amber-500', titleColor: 'text-amber-950', pill: 'bg-amber-100 text-amber-800' },
  lavender: { cardBg: 'bg-purple-50/60', border: 'border-purple-200', headerBg: 'bg-purple-600', titleColor: 'text-purple-950', pill: 'bg-purple-100 text-purple-800' },
  pink: { cardBg: 'bg-rose-50/60', border: 'border-rose-200', headerBg: 'bg-rose-500', titleColor: 'text-rose-950', pill: 'bg-rose-100 text-rose-800' },
  blue: { cardBg: 'bg-sky-50/60', border: 'border-sky-200', headerBg: 'bg-sky-600', titleColor: 'text-sky-950', pill: 'bg-sky-100 text-sky-800' }
};

export const InfographicView: React.FC<InfographicViewProps> = ({ data }) => {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white p-6 md:p-10 border border-slate-200 shadow-xl space-y-8 font-sans">
      {/* Top Banner: Key Stats / Highlights */}
      {data.keyStats && data.keyStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {data.keyStats.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-cream-50 to-pink-50/40 border border-purple-200/80 text-center space-y-1 shadow-sm hover:scale-102 transition-transform"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 block">
                {stat.label}
              </span>
              <div className="text-base md:text-xl font-black text-navy-950">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editorial Infographic Sections */}
      <div className="space-y-8">
        {data.sections.map((section, sIdx) => {
          const style = colorStyles[section.color || 'mint'] || colorStyles.mint;

          return (
            <div
              key={section.id || sIdx}
              className={`rounded-3xl border-2 ${style.border} ${style.cardBg} p-6 md:p-8 space-y-5 shadow-sm`}
            >
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                <div>
                  <h3 className={`text-base md:text-lg font-black ${style.titleColor} tracking-tight`}>
                    {section.title}
                  </h3>
                  {section.tagline && (
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {section.tagline}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${style.pill}`}>
                  Section {sIdx + 1}
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                          <Lightbulb className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs md:text-sm font-extrabold text-navy-950">
                          {item.title}
                        </h4>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {item.text}
                    </p>

                    {/* Formula Callout Box if applicable */}
                    {item.formula && (
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-mono font-bold text-center shadow-sm">
                        📐 {item.formula}
                      </div>
                    )}

                    {/* Real Example or Metric Pill */}
                    {item.stat && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Key Takeaway: {item.stat}</span>
                      </div>
                    )}

                    {item.slideReference && (
                      <div className="text-[10px] font-mono text-slate-400 text-right pt-1">
                        📄 {item.slideReference}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Target,
  Zap,
  Activity,
  Award,
  HelpCircle,
  Network
} from 'lucide-react';
import { MindMapNode } from '../../types';

interface MindMapViewProps {
  data: {
    root: MindMapNode;
  };
}

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; accent: string }> = {
  lavender: { bg: 'bg-purple-50/80', border: 'border-purple-200', text: 'text-purple-950', badge: 'bg-purple-100 text-purple-700', accent: '#a855f7' },
  pink: { bg: 'bg-rose-50/80', border: 'border-rose-200', text: 'text-rose-950', badge: 'bg-rose-100 text-rose-700', accent: '#f43f5e' },
  mint: { bg: 'bg-emerald-50/80', border: 'border-emerald-200', text: 'text-emerald-950', badge: 'bg-emerald-100 text-emerald-700', accent: '#10b981' },
  yellow: { bg: 'bg-amber-50/80', border: 'border-amber-200', text: 'text-amber-950', badge: 'bg-amber-100 text-amber-800', accent: '#f59e0b' },
  blue: { bg: 'bg-sky-50/80', border: 'border-sky-200', text: 'text-sky-950', badge: 'bg-sky-100 text-sky-700', accent: '#0284c7' },
  peach: { bg: 'bg-orange-50/80', border: 'border-orange-200', text: 'text-orange-950', badge: 'bg-orange-100 text-orange-800', accent: '#ea580c' }
};

export const MindMapView: React.FC<MindMapViewProps> = ({ data }) => {
  const root = data.root;
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (nodeId: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.4, Math.max(0.7, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(1);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-radial from-cream-50 via-white to-purple-50/30 p-4 md:p-8 border border-purple-100 shadow-inner min-h-[600px] flex flex-col font-sans">
      {/* Zoom / View Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-200/60 shadow-soft">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 rounded-xl text-charcoal-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 rounded-xl text-charcoal-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetZoom}
          className="p-2 rounded-xl text-charcoal-600 hover:text-purple-600 hover:bg-purple-50 transition-colors text-xs font-bold"
          title="Reset Zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-bold text-purple-700 px-2 font-mono">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>

      {/* Main Canvas with Transform Scale */}
      <div
        className="w-full flex-1 flex flex-col items-center transition-transform duration-200 origin-top"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Central Root Concept Bubble */}
        <div className="relative z-10 max-w-xl mx-auto my-6 p-6 rounded-3xl bg-linear-to-br from-purple-100 via-rose-50 to-amber-50 border-2 border-purple-300 shadow-xl text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] font-extrabold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CORE CHAPTER THEME</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-purple-950 tracking-tight">
            {root.label}
          </h2>
          {root.description && (
            <p className="text-xs md:text-sm text-purple-900/80 leading-relaxed font-medium max-w-md mx-auto">
              {root.description}
            </p>
          )}
          {root.slideReference && (
            <div className="inline-block mt-2 text-[10px] font-bold text-purple-700 font-mono bg-white/70 px-2.5 py-0.5 rounded-full border border-purple-200">
              📄 {root.slideReference}
            </div>
          )}
        </div>

        {/* Primary Concept Branches Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {root.children?.map((branch, idx) => {
            const theme = colorMap[branch.color || 'lavender'] || colorMap.lavender;
            const isCollapsed = collapsedNodes[branch.id];

            return (
              <div
                key={branch.id || idx}
                className={`relative rounded-3xl p-5 border-2 ${theme.border} ${theme.bg} shadow-md transition-all hover:shadow-lg space-y-3.5`}
              >
                {/* Branch Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      {branch.badge && (
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider mb-1 ${theme.badge}`}>
                          {branch.badge}
                        </span>
                      )}
                      <h3 className={`text-sm md:text-base font-extrabold ${theme.text} tracking-tight`}>
                        {branch.label}
                      </h3>
                    </div>
                  </div>

                  {branch.children && branch.children.length > 0 && (
                    <button
                      onClick={() => toggleCollapse(branch.id)}
                      className="p-1.5 rounded-xl hover:bg-white/60 text-charcoal-500 transition-colors"
                      title={isCollapsed ? 'Expand branch' : 'Collapse branch'}
                    >
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {branch.description && (
                  <p className="text-xs text-charcoal-700 leading-relaxed font-normal bg-white/60 p-3 rounded-2xl border border-white/80">
                    {branch.description}
                  </p>
                )}

                {/* Sub-Concept Children Cards */}
                {!isCollapsed && branch.children && branch.children.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-purple-200/40">
                    <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                      Subtopics & Details:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {branch.children.map((sub, sIdx) => (
                        <div
                          key={sub.id || sIdx}
                          className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-300 transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                              {sub.label}
                            </span>
                            {sub.slideReference && (
                              <span className="text-[10px] font-mono text-charcoal-400">
                                {sub.slideReference}
                              </span>
                            )}
                          </div>
                          {sub.description && (
                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans pl-3.5">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {branch.slideReference && (
                  <div className="text-[10px] font-mono text-charcoal-400 text-right pt-1">
                    📖 {branch.slideReference}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

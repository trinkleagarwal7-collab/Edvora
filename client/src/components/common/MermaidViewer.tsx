import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  chart: string;
  className?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    });

    let isMounted = true;

    const renderChart = async () => {
      if (!chart || !chart.trim()) return;
      try {
        setHasError(false);
        const uniqueId = `mermaid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const { svg } = await mermaid.render(uniqueId, chart.trim());
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.warn('[MermaidViewer] Render error:', err);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (hasError) {
    return (
      <div className={`p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 ${className}`}>
        <p className="font-semibold text-slate-700 mb-2">Concept Framework Diagram:</p>
        <pre className="overflow-x-auto whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-slate-400 animate-pulse">
        Rendering concept diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-wrapper overflow-x-auto p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex justify-center ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

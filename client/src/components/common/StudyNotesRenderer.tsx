import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudyNotesRendererProps {
  content: string;
}

export const StudyNotesRenderer: React.FC<StudyNotesRendererProps> = ({ content }) => {
  // Clean up any extra artifacts or consecutive hashtags if present in raw text
  const cleanContent = (content || '').trim();

  return (
    <div className="study-notes-container text-slate-800 text-xs md:text-sm leading-relaxed space-y-3 font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // H1: Main note document title (clean, elegant, no harsh borders)
          h1: ({ children }) => (
            <div className="pb-2 mb-3 border-b border-slate-200">
              <h1 className="text-base md:text-lg font-extrabold text-navy-900 tracking-tight flex items-center gap-2">
                {children}
              </h1>
            </div>
          ),

          // H2: Major section heading (clean note pill or subtle accent)
          h2: ({ children }) => (
            <div className="mt-4 mb-2 pt-2">
              <h2 className="text-xs md:text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2 text-teal-800">
                <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block" />
                <span>{children}</span>
              </h2>
            </div>
          ),

          // H3: Topic / Concept heading
          h3: ({ children }) => (
            <h3 className="text-xs md:text-sm font-bold text-navy-900 mt-3 mb-1.5 flex items-center gap-1.5">
              <span className="text-teal-600">•</span>
              <span>{children}</span>
            </h3>
          ),

          // Paragraphs: Comfortable reading line-height and crisp text color
          p: ({ children }) => (
            <p className="text-xs md:text-[13px] text-slate-700 leading-relaxed my-1.5 font-normal">
              {children}
            </p>
          ),

          // Lists: Clean, aligned bullet points with comfortable spacing
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 pl-4 list-disc marker:text-teal-600 text-xs md:text-[13px] text-slate-700">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 pl-4 list-decimal marker:text-navy-900 marker:font-bold text-xs md:text-[13px] text-slate-700">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="leading-relaxed pl-1">
              {children}
            </li>
          ),

          // Strong / Bold: Clean emphasis without asterisks
          strong: ({ children }) => (
            <strong className="font-bold text-navy-900">
              {children}
            </strong>
          ),

          // Tables: Beautifully formatted responsive note tables
          table: ({ children }) => (
            <div className="my-3.5 overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-slate-50/90 border-b border-slate-200 text-navy-900 font-bold uppercase tracking-wider text-[11px]">
              {children}
            </thead>
          ),

          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100">
              {children}
            </tbody>
          ),

          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/60 transition-colors">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold text-navy-900 text-xs whitespace-nowrap">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="px-3.5 py-2 text-slate-700 text-xs align-top">
              {children}
            </td>
          ),

          // Blockquotes: Executive summary & core definition callout cards
          blockquote: ({ children }) => (
            <div className="my-3 p-3.5 rounded-xl bg-teal-50/70 border-l-4 border-teal-600 text-teal-950 text-xs md:text-[13px] leading-relaxed shadow-2xs">
              <div className="font-medium italic">
                {children}
              </div>
            </div>
          ),

          // Inline Code / Terms
          code: ({ children, className }) => {
            const isBlock = className && className.includes('language-');
            if (isBlock) {
              return (
                <pre className="p-3 my-2 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 font-mono text-[11px] text-navy-900 font-semibold">
                {children}
              </code>
            );
          },

          hr: () => <hr className="my-4 border-slate-200/80" />
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

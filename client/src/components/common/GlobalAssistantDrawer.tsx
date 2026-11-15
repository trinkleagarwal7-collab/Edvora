import React, { useState } from 'react';
import { X, Sparkles, Send, BookOpen, FileText, ArrowRight, BookMarked, HelpCircle } from 'lucide-react';
import { api } from '../../api';

interface GlobalAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext?: {
    subjectId?: string | null;
    subjectName?: string | null;
    fileId?: string | null;
    fileName?: string | null;
    topicName?: string | null;
  };
  onNavigateToStudyRoom?: (context: any) => void;
}

export const GlobalAssistantDrawer: React.FC<GlobalAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeContext = {},
  onNavigateToStudyRoom
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'Explain this concept in simple terms (ELI15)',
    'Summarize this topic based on uploaded slides',
    'What potential examination questions could be asked?',
    'Explain the key formulas and variables',
    'Compare the core frameworks in this material'
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await api.askAi({
        query: text.trim(),
        mode: 'eli15',
        scope: {
          subjectId: activeContext.subjectId || null,
          fileId: activeContext.fileId || null
        }
      });
      setResponse(res);
    } catch (err: any) {
      setResponse({
        answer: `Error: ${err.message}`,
        citations: [],
        isGrounded: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-navy-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Global AI Study Assistant</h3>
                <p className="text-[11px] text-slate-300">Grounded in your academic materials</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Badge */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Current Study Context:</span>
            </div>
            <div className="flex items-center gap-2 text-navy-900 font-semibold truncate">
              {activeContext.subjectName ? (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{activeContext.subjectName}</span>
                  {activeContext.fileName && (
                    <>
                      <span className="text-slate-400">/</span>
                      <FileText className="w-3.5 h-3.5 text-navy-600 shrink-0" />
                      <span className="truncate text-slate-600">{activeContext.fileName}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-slate-400 font-normal italic">
                  General Library (Open a subject to ground specifically)
                </span>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Prompts */}
            {!response && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Academic Shortcuts
                </p>
                <div className="space-y-1.5">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputQuery(prompt);
                        handleSend(prompt);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/60 text-left text-xs font-medium text-slate-700 hover:text-teal-900 transition-all flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center gap-3 text-xs text-teal-800">
                <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                <span>Consulting your uploaded slides and synthesizing answer...</span>
              </div>
            )}

            {/* Answer Display */}
            {response && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-navy-900 space-y-2 leading-relaxed">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-teal-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Academic Tutor Response
                    </span>
                    <button
                      onClick={() => setResponse(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap">{response.answer}</div>

                  {/* Citations */}
                  {response.citations?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Verified Sources in Uploaded Documents:
                      </p>
                      <ul className="space-y-1">
                        {response.citations.map((c: any, idx: number) => (
                          <li key={idx} className="text-[11px] text-teal-800 font-mono">
                            • {c.fileName} {c.slideNumber ? `(Slide ${c.slideNumber})` : c.pageNumber ? `(Page ${c.pageNumber})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {onNavigateToStudyRoom && (
                  <button
                    onClick={() => {
                      onNavigateToStudyRoom({
                        subjectId: activeContext.subjectId,
                        fileId: activeContext.fileId,
                        query: inputQuery
                      });
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Open in Full AI Study Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about your course materials..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-navy-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-all shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

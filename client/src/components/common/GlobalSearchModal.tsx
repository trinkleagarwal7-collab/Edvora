import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileText, Bookmark, Sparkles, HelpCircle } from 'lucide-react';
import { api } from '../../api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, context?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.searchGlobal(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-charcoal-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EBE7DF] overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#F5F2EB] gap-3">
          <Search className="w-5 h-5 text-charcoal-400 shrink-0" />
          <input
            type="text"
            placeholder="Search subjects, lecture slides, topics, notes, flashcards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm font-medium text-charcoal-900 placeholder:text-charcoal-400 bg-transparent outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-[#F5F2EB] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] bg-[#FAF9F5] px-2 py-0.5 rounded-lg border border-[#EBE7DF] font-mono text-charcoal-500">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {isLoading && (
            <div className="py-10 text-center text-xs text-charcoal-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>Searching your academic library...</span>
            </div>
          )}

          {!isLoading && !results && (
            <div className="py-10 text-center text-xs text-charcoal-400">
              Type at least 2 characters to search across all uploaded course materials.
            </div>
          )}

          {!isLoading && results && results.totalMatches === 0 && (
            <div className="py-10 text-center text-xs text-charcoal-500">
              No matching content found in your uploaded materials for "{query}".
            </div>
          )}

          {!isLoading && results && results.totalMatches > 0 && (
            <div className="space-y-4">
              {/* Subjects */}
              {results.subjects?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 mb-2 px-2">
                    Courses & Subjects
                  </h4>
                  <div className="space-y-1">
                    {results.subjects.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onNavigate('courses', { subjectId: s.id });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-brand-50/50 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-charcoal-900 group-hover:text-brand-700">{s.name}</span>
                        </div>
                        <span className="text-[10px] text-charcoal-400 font-medium">Open Course</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Files */}
              {results.files?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 mb-2 px-2">
                    Course Documents & Slides
                  </h4>
                  <div className="space-y-1">
                    {results.files.map((f: any) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onNavigate('courses', { subjectId: f.subjectId, fileId: f.id });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF9F5] text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-charcoal-900 block">{f.originalName}</span>
                            <span className="text-[11px] text-charcoal-400">in {f.subjectName}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full font-semibold">
                          {f.slideCount ? `${f.slideCount} slides` : f.pageCount ? `${f.pageCount} pages` : 'Doc'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Chunks (Slide/Page content) */}
              {results.chunks?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 mb-2 px-2">
                    Lecture Slides & Content Matches
                  </h4>
                  <div className="space-y-2">
                    {results.chunks.map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('tutor', {
                            subjectId: c.subjectId,
                            fileId: c.fileId,
                            query: c.heading || query
                          });
                          onClose();
                        }}
                        className="p-3.5 rounded-2xl bg-[#FAF9F5] hover:bg-brand-50/50 border border-[#EBE7DF] hover:border-brand-200 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-charcoal-900">{c.heading || 'Content'}</span>
                          <span className="text-[10px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                            {c.fileName} {c.slideNumber ? `(Slide ${c.slideNumber})` : c.pageNumber ? `(Page ${c.pageNumber})` : ''}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">{c.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Notes */}
              {results.notes?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 mb-2 px-2">
                    Saved Study Notes
                  </h4>
                  <div className="space-y-1">
                    {results.notes.map((n: any) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          onNavigate('tutor', { subjectId: n.subjectId, noteId: n.id });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF9F5] text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center">
                            <Bookmark className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-charcoal-900">{n.title}</span>
                        </div>
                        <span className="text-[10px] text-charcoal-400">in {n.subjectName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

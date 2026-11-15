import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  Send,
  Bookmark,
  Layers,
  ArrowRight,
  X,
  HelpCircle,
  RotateCcw,
  Zap,
  GraduationCap,
  Lightbulb
} from 'lucide-react';
import { api } from '../../api';
import { Subject, CourseFile, Topic, StudyNote, Citation } from '../../types';
import { MermaidViewer } from '../../components/common/MermaidViewer';
import { StudyNotesRenderer } from '../../components/common/StudyNotesRenderer';

interface StudyRoomPageProps {
  initialSubjectId?: string | null;
  initialFileId?: string | null;
  initialQuery?: string;
  onNavigateToCourses: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  citations?: Citation[];
  visualContent?: string | null;
  visualType?: string | null;
  timestamp: string;
  apiKeyNotice?: string;
}

export const StudyRoomPage: React.FC<StudyRoomPageProps> = ({
  initialSubjectId = null,
  initialFileId = null,
  initialQuery = '',
  onNavigateToCourses
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(initialSubjectId);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(initialFileId);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Simple Explanation Modes:
  // 'eli15' = Simple Explanation
  // 'detailed' = Detailed Explanation
  // 'exam' = Exam Preparation
  const [mode, setMode] = useState<'eli15' | 'detailed' | 'exam'>('eli15');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);

  // Saved Notes modal
  const [activeNoteModal, setActiveNoteModal] = useState<StudyNote | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Curated High-Yield Prompt Shortcuts
  const scalenPrompts = [
    {
      label: '📖 Explain Full Presentation',
      query: 'Please read through this entire presentation and explain every slide in detail with real MBA Product Management examples, trade-offs, and an architecture diagram.'
    },
    {
      label: '💡 Give Me an Example',
      query: 'Give me a relatable real-world product management example (like Spotify, Uber, or Netflix) explaining this concept.'
    },
    {
      label: '⚖️ Key Trade-offs & Architecture',
      query: 'Explain the technical architecture and strategic trade-offs (pros vs cons, scalability) highlighted in this material.'
    },
    {
      label: '📝 5-Min Revision Notes',
      query: 'Create concise 5-minute study notes summarizing the core definitions and high-yield exam takeaways from this presentation.'
    }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialSubjectId]);

  useEffect(() => {
    if (initialFileId) {
      setSelectedFileId(initialFileId);
    }
  }, [initialFileId]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadSubjectFiles(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadInitialData = async () => {
    try {
      const subjs = await api.getSubjects();
      setSubjects(subjs);
      if (subjs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjs[0].id);
      }
      if (initialQuery && initialQuery.trim()) {
        handleSendMessage(initialQuery);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const loadSubjectFiles = async (subjectId: string) => {
    try {
      const data = await api.getSubject(subjectId);
      setFiles(data.files || []);
      setTopics(data.topics || []);
      if (initialFileId) {
        setSelectedFileId(initialFileId);
      }
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || !selectedSubjectId) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const scope: any = { subjectId: selectedSubjectId };
      const targetFileId = selectedFileId || initialFileId;
      if (targetFileId) scope.fileId = targetFileId;

      const res = await api.askAi({
        query: text.trim(),
        mode,
        scope
      });

      const assistantMessage: ChatMessage = {
        id: `msg_assistant_${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        mode: res.mode,
        citations: res.citations || [],
        visualContent: res.visualContent,
        visualType: res.visualType,
        timestamp: new Date().toISOString(),
        apiKeyNotice: res.apiKeyNotice
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: `Notice: ${err.message || 'Could not consult AI service. Verify your lecture notes are uploaded.'}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStudyNotes = async () => {
    if (!selectedSubjectId) return;
    setIsGeneratingNotes(true);
    try {
      const note = await api.generateNotes({
        subjectId: selectedSubjectId,
        fileId: selectedFileId || undefined
      });
      setActiveNoteModal(note);
    } catch (err: any) {
      alert(`Could not synthesize study notes: ${err.message}`);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  if (subjects.length === 0) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-3xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600 mx-auto shadow-soft">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold text-charcoal-900 tracking-tight">AI Study Room Awaiting Course Notes</h3>
        <p className="text-xs md:text-sm text-charcoal-500 max-w-sm mx-auto leading-relaxed">
          Edvora's AI professor explains concepts strictly grounded in your own uploaded MBA notes. Upload a course presentation to begin.
        </p>
        <button
          onClick={onNavigateToCourses}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-all shadow-md active:scale-98"
        >
          <span>Go to My Courses</span>
        </button>
      </div>
    );
  }

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const selectedFile = files.find((f) => f.id === selectedFileId);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-cream-100 font-sans">
      {/* Scope & Mode Control Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-cream-300/80 px-4 md:px-8 py-3 shrink-0 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-5xl mx-auto w-full">
          {/* Learning Scope Selectors */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Subject Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-50 border border-cream-300 text-charcoal-800 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <select
                value={activeSubject.id}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedFileId(null);
                }}
                className="bg-transparent font-bold text-charcoal-900 outline-hidden cursor-pointer text-xs"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-50 border border-cream-300 text-charcoal-800 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
              <select
                value={selectedFileId || ''}
                onChange={(e) => setSelectedFileId(e.target.value || null)}
                className="bg-transparent text-charcoal-700 font-semibold outline-hidden cursor-pointer max-w-[220px] truncate text-xs"
              >
                <option value="">📚 All Uploaded Notes in Course</option>
                {files.map((f) => (
                  <option key={f.id} value={f.id}>
                    📄 {f.originalName} {f.slideCount ? `(${f.slideCount} slides)` : f.pageCount ? `(${f.pageCount} pages)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action: Generate Study Notes */}
          <button
            onClick={handleGenerateStudyNotes}
            disabled={isGeneratingNotes}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-900 text-xs font-bold transition-colors border border-cream-300 shadow-2xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-brand-600" />
            <span>{isGeneratingNotes ? 'Synthesizing...' : 'Save Study Notes'}</span>
          </button>
        </div>

        {/* Explanation Mode Selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-cream-200/70 max-w-5xl mx-auto w-full">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mr-1">
            Explanation Mode:
          </span>

          <button
            onClick={() => setMode('eli15')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'eli15'
                ? 'bg-charcoal-900 text-white shadow-xs'
                : 'text-charcoal-600 hover:bg-cream-100'
            }`}
          >
            Simple Explanation
          </button>

          <button
            onClick={() => setMode('detailed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'detailed'
                ? 'bg-charcoal-900 text-white shadow-xs'
                : 'text-charcoal-600 hover:bg-cream-100'
            }`}
          >
            Detailed MBA
          </button>

          <button
            onClick={() => setMode('exam')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'exam'
                ? 'bg-charcoal-900 text-white shadow-xs'
                : 'text-charcoal-600 hover:bg-cream-100'
            }`}
          >
            Exam Preparation
          </button>
        </div>
      </div>

      {/* Focused Presentation Banner */}
      {selectedFile && (
        <div className="mx-4 md:mx-8 mt-3 p-3.5 rounded-2xl bg-brand-50/80 border border-brand-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs max-w-4xl self-center w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5 text-brand-900 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-brand-200/80 flex items-center justify-center text-brand-700 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium truncate">
              Ready to explain: <strong className="text-charcoal-900">{selectedFile.originalName}</strong> {selectedFile.slideCount ? `(${selectedFile.slideCount} slides)` : selectedFile.pageCount ? `(${selectedFile.pageCount} pages)` : ''}
            </span>
          </div>

          <button
            onClick={() =>
              handleSendMessage(
                `Please read through this entire presentation (${selectedFile.originalName}) and explain every slide in detail with real MBA Product Management examples, key trade-offs, and an architecture diagram.`
              )
            }
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shrink-0 transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto active:scale-98 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Explain Entire PPT</span>
          </button>
        </div>
      )}

      {/* Main Learning Chat Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="p-8 text-center my-auto space-y-6">
            <div className="w-14 h-14 rounded-3xl bg-brand-50 border border-brand-200/70 flex items-center justify-center text-brand-600 mx-auto shadow-soft">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg md:text-xl font-extrabold text-charcoal-900 tracking-tight">
                AI Professor Ready for {activeSubject.name}
              </h3>
              <p className="text-xs md:text-sm text-charcoal-500 leading-relaxed">
                Grounded directly in your {files.length} uploaded document{files.length === 1 ? '' : 's'}. Ask anything or pick a quick study prompt below.
              </p>
            </div>

            {/* Prompt Shortcut Chips */}
            <div className="pt-2 max-w-xl mx-auto space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scalenPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.query)}
                    className="p-3.5 rounded-2xl bg-white hover:bg-cream-50 border border-cream-300 text-left transition-all flex items-center justify-between group shadow-soft card-hover"
                  >
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-brand-700 transition-colors">
                      {item.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-charcoal-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] md:max-w-[85%] rounded-3xl p-5 md:p-6 shadow-soft leading-relaxed text-xs md:text-sm ${
                  msg.role === 'user'
                    ? 'bg-charcoal-900 text-white font-medium rounded-br-xs'
                    : 'bg-white border border-cream-300/90 text-charcoal-900 rounded-bl-xs'
                }`}
              >
                {/* Assistant Note Header */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-cream-200 text-xs">
                    <span className="font-bold text-brand-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      AI Study Notes
                    </span>
                    <span className="text-[10px] font-bold text-charcoal-400 capitalize bg-cream-100 px-2.5 py-0.5 rounded-full border border-cream-200">
                      {msg.mode === 'eli15'
                        ? 'Simple Explanation'
                        : msg.mode === 'exam'
                        ? 'Exam Prep'
                        : 'Detailed MBA'}
                    </span>
                  </div>
                )}

                {/* Message Content formatted with StudyNotesRenderer */}
                {msg.role === 'assistant' ? (
                  <StudyNotesRenderer content={msg.content} />
                ) : (
                  <div className="font-sans leading-relaxed text-xs md:text-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                )}

                {/* Dynamic Mermaid Diagram */}
                {msg.visualContent && (
                  <div className="mt-5 pt-4 border-t border-cream-200">
                    <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block mb-2">
                      Architecture / Process Diagram:
                    </span>
                    <MermaidViewer chart={msg.visualContent} />
                  </div>
                )}

                {/* Verified Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-cream-200 text-[11px]">
                    <span className="font-bold text-charcoal-400 block mb-1.5 uppercase tracking-wider text-[10px]">
                      Source in your uploaded materials:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-cream-100 text-charcoal-700 font-mono text-[10px] border border-cream-200"
                        >
                          📄 {c.fileName} {c.slideNumber ? `(Slide ${c.slideNumber})` : c.pageNumber ? `(Page ${c.pageNumber})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {msg.apiKeyNotice && (
                  <div className="mt-3 text-[10px] text-brand-800 bg-brand-50 p-2.5 rounded-xl border border-brand-200/60">
                    💡 {msg.apiKeyNotice}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-soft flex items-center gap-3 text-xs text-charcoal-500 max-w-md animate-pulse">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Consulting your uploaded slides and synthesizing notes...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white/90 backdrop-blur-md border-t border-cream-300/80 p-4 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2.5"
        >
          <input
            type="text"
            placeholder={`Ask AI tutor about ${activeSubject.name} (e.g. explain trade-offs, give examples)...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl border border-cream-300 text-xs md:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-hidden focus:border-brand-500 bg-cream-50/70 focus:bg-white transition-all shadow-2xs"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-3 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-98 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>
      </div>

      {/* Modal: Saved Study Note */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-cream-300 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-charcoal-900 text-white">
              <h4 className="text-xs md:text-sm font-bold truncate">{activeNoteModal.title}</h4>
              <button onClick={() => setActiveNoteModal(null)}>
                <X className="w-4 h-4 text-charcoal-400 hover:text-white" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-3 flex-1 text-xs text-charcoal-900 leading-relaxed bg-cream-50/30">
              <StudyNotesRenderer content={activeNoteModal.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

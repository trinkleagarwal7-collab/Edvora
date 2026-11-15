import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Search,
  X,
  ArrowRight,
  ChevronRight,
  FolderOpen,
  FileUp,
  SlidersHorizontal,
  BookmarkCheck
} from 'lucide-react';
import { api } from '../../api';
import { Subject, CourseFile, Topic, Chunk } from '../../types';

interface CoursesPageProps {
  initialSubjectId?: string | null;
  onNavigateToStudyRoom: (context: { subjectId: string; fileId?: string; topicName?: string; query?: string }) => void;
  onNavigateToQuiz: (context: { subjectId: string; fileId?: string; topicName?: string }) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  initialSubjectId = null,
  onNavigateToStudyRoom,
  onNavigateToQuiz
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(initialSubjectId);
  const [subjectData, setSubjectData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'topics'>('files');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [previewFile, setPreviewFile] = useState<{ file: CourseFile; chunks: Chunk[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialSubjectId]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadSubjectDetails(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubjectDetails = async (id: string) => {
    try {
      const data = await api.getSubject(id);
      setSubjectData(data);
    } catch (err) {
      console.error('Failed to load subject details:', err);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const newSubj = await api.createSubject({
        name: newSubjectName.trim(),
        description: newSubjectDesc.trim(),
        color: '#7C65C1'
      });
      setSubjects((prev) => [...prev, newSubj]);
      setSelectedSubjectId(newSubj.id);
      setIsCreateModalOpen(false);
      setNewSubjectName('');
      setNewSubjectDesc('');
    } catch (err: any) {
      alert(`Error creating course: ${err.message}`);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" and all its uploaded lecture materials?`)) return;
    try {
      await api.deleteSubject(id);
      const remaining = subjects.filter((s) => s.id !== id);
      setSubjects(remaining);
      setSelectedSubjectId(remaining.length > 0 ? remaining[0].id : null);
      setSubjectData(null);
    } catch (err: any) {
      alert(`Failed to delete course: ${err.message}`);
    }
  };

  const handleFilesChosen = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0 || !selectedSubjectId) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      await api.uploadFiles(selectedSubjectId, Array.from(fileList));
      await loadSubjectDetails(selectedSubjectId);
      await loadSubjects();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesChosen(e.dataTransfer.files);
    }
  };

  const handleReprocessFile = async (fileId: string) => {
    try {
      await api.reprocessFile(fileId);
      if (selectedSubjectId) await loadSubjectDetails(selectedSubjectId);
    } catch (err: any) {
      alert(`Reprocessing failed: ${err.message}`);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      await api.deleteFile(fileId);
      if (selectedSubjectId) {
        await loadSubjectDetails(selectedSubjectId);
        await loadSubjects();
      }
    } catch (err: any) {
      alert(`Failed to delete file: ${err.message}`);
    }
  };

  const handlePreviewFile = async (fileId: string) => {
    try {
      const data = await api.getFilePreview(fileId);
      setPreviewFile(data);
    } catch (err: any) {
      alert(`Failed to preview file: ${err.message}`);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedSubjectId) return;

    try {
      await api.createTopic(selectedSubjectId, {
        name: newTopicName.trim()
      });
      await loadSubjectDetails(selectedSubjectId);
      setNewTopicName('');
      setIsAddTopicOpen(false);
    } catch (err: any) {
      alert(`Failed to add topic: ${err.message}`);
    }
  };

  const handleUpdateTopicStatus = async (topicId: string, newStatus: string) => {
    try {
      await api.updateTopic(topicId, { status: newStatus });
      if (selectedSubjectId) await loadSubjectDetails(selectedSubjectId);
    } catch (err: any) {
      console.error('Failed to update topic status:', err);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await api.deleteTopic(topicId);
      if (selectedSubjectId) await loadSubjectDetails(selectedSubjectId);
    } catch (err: any) {
      console.error('Failed to delete topic:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-charcoal-400">Loading academic library...</p>
      </div>
    );
  }

  // Empty State if no subjects created yet
  if (subjects.length === 0) {
    return (
      <div className="p-6 md:p-12 max-w-xl mx-auto text-center space-y-4 font-sans">
        <div className="w-14 h-14 rounded-3xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600 mx-auto shadow-soft">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold text-charcoal-900 tracking-tight">Your Academic Library is Empty</h3>
        <p className="text-xs md:text-sm text-charcoal-500 max-w-sm mx-auto leading-relaxed">
          Create your MBA courses to upload lecture presentations, handouts, case studies and syllabus topics.
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-all shadow-md active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Create First Course</span>
        </button>

        {isCreateModalOpen && (
          <CreateSubjectModal
            name={newSubjectName}
            desc={newSubjectDesc}
            setName={setNewSubjectName}
            setDesc={setNewSubjectDesc}
            onSubmit={handleCreateSubject}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </div>
    );
  }

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const allFiles: CourseFile[] = subjectData?.files || [];
  const filteredFiles = allFiles.filter((f) =>
    f.originalName.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );
  const topics: Topic[] = subjectData?.topics || [];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200 font-sans">
      {/* Course Switcher Pills & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cream-200/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider shrink-0 mr-1">
            Courses:
          </span>
          {subjects.map((s) => {
            const isActive = s.id === activeSubject.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-charcoal-900 text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-cream-100 text-charcoal-600 border border-cream-300'
                }`}
              >
                <span>{s.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-500'
                  }`}
                >
                  {s.fileCount || 0}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-cream-50 text-charcoal-800 border border-cream-300 text-xs font-bold transition-all shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-brand-600" />
          <span>New Course</span>
        </button>
      </div>

      {/* Course Academic Card Overview */}
      <div className="p-6 md:p-7 rounded-3xl bg-white border border-cream-300/90 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <h2 className="text-xl md:text-2xl font-extrabold text-charcoal-900 tracking-tight">
                {activeSubject.name}
              </h2>
            </div>
            <p className="text-xs md:text-sm text-charcoal-500 leading-relaxed max-w-xl">
              {activeSubject.description || 'Personal MBA course materials, faculty lecture presentations and study syllabus.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => onNavigateToStudyRoom({ subjectId: activeSubject.id })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Ask AI Tutor</span>
            </button>

            <button
              onClick={() => onNavigateToQuiz({ subjectId: activeSubject.id })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 border border-cream-300 text-xs font-bold transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-sage-600" />
              <span>Take Quiz</span>
            </button>

            <button
              onClick={() => handleDeleteSubject(activeSubject.id, activeSubject.name)}
              className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete this course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="pt-3 border-t border-cream-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-charcoal-400 font-medium">Syllabus Progress:</span>
            <div className="w-36 h-2 rounded-full bg-cream-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-coral-400 rounded-full"
                style={{ width: `${Math.max(6, activeSubject.progressPercent || 0)}%` }}
              />
            </div>
            <span className="font-bold text-charcoal-900">
              {activeSubject.progressPercent || 0}%
            </span>
          </div>

          <span className="text-charcoal-400 font-medium text-[11px]">
            {allFiles.length} file{allFiles.length === 1 ? '' : 's'} uploaded • {topics.length} syllabus topic{topics.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Tabs: Uploaded Files vs Topics & Syllabus */}
      <div className="space-y-5">
        <div className="flex items-center gap-4 border-b border-cream-300/80">
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'files'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-charcoal-400 hover:text-charcoal-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Course Library ({allFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('topics')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'topics'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-charcoal-400 hover:text-charcoal-600'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Topics & Syllabus ({topics.length})</span>
          </button>
        </div>

        {/* TAB 1: UPLOADED FILES */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            {/* Simple Drag-and-Drop Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 md:p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2.5 ${
                isDragging
                  ? 'border-brand-500 bg-brand-50/70 scale-[0.99]'
                  : 'border-cream-300/90 bg-white/70 hover:bg-white hover:border-brand-300 shadow-2xs'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.md,.zip"
                onChange={(e) => e.target.files && handleFilesChosen(e.target.files)}
                className="hidden"
              />

              <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200/60 shadow-2xs">
                {isUploading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <FileUp className="w-5 h-5" />
                )}
              </div>

              <div>
                <p className="text-xs md:text-sm font-bold text-charcoal-900">
                  {isUploading ? 'Extracting and reading lecture slides...' : 'Drop lecture files here, or click to browse'}
                </p>
                <p className="text-[11px] text-charcoal-400 mt-0.5">
                  Supports PowerPoint (.pptx), PDF lecture notes, Word (.docx) & Case Studies
                </p>
              </div>
            </div>

            {uploadError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Search Filter for Files */}
            {allFiles.length > 3 && (
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter materials by name..."
                  value={fileSearchQuery}
                  onChange={(e) => setFileSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-cream-300 text-xs text-charcoal-900 bg-white placeholder:text-charcoal-400 focus:outline-hidden focus:border-brand-500"
                />
              </div>
            )}

            {/* File Cards List */}
            {filteredFiles.length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-white border border-cream-300 text-xs text-charcoal-400 space-y-1">
                <FolderOpen className="w-8 h-8 mx-auto text-charcoal-300 mb-2" />
                <p className="font-bold text-charcoal-700">No materials in this course yet</p>
                <p>Upload your faculty presentations above to start studying.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredFiles.map((file) => {
                  const isError = file.status === 'error';
                  const isProcessing = file.status === 'processing';
                  const isReady = file.status === 'processed';
                  const isPpt = file.originalName.toLowerCase().endsWith('.pptx') || file.originalName.toLowerCase().endsWith('.ppt');
                  const isPdf = file.originalName.toLowerCase().endsWith('.pdf');

                  return (
                    <div
                      key={file.id}
                      className="p-4 md:p-5 rounded-2xl bg-white border border-cream-300 hover:border-brand-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft card-hover"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs ${
                            isPpt
                              ? 'bg-coral-50 text-coral-600 border border-coral-200/60'
                              : isPdf
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                              : 'bg-brand-50 text-brand-600 border border-brand-200/60'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs md:text-sm font-bold text-charcoal-900 truncate">
                            {file.originalName}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-charcoal-400">
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            {file.slideCount && <span>• {file.slideCount} slides</span>}
                            {file.pageCount && <span>• {file.pageCount} pages</span>}
                            <span>•</span>
                            {isReady && (
                              <span className="text-sage-700 font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                                Ready for AI & Quiz
                              </span>
                            )}
                            {isProcessing && (
                              <span className="text-amber-600 font-bold flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Indexing slides...
                              </span>
                            )}
                            {isError && (
                              <span className="text-rose-600 font-bold">Error reading file</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* File Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        {isReady && (
                          <>
                            <button
                              onClick={() => handlePreviewFile(file.id)}
                              className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-100 transition-colors"
                              title="Preview extracted slide chunks"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                onNavigateToStudyRoom({
                                  subjectId: activeSubject.id,
                                  fileId: file.id,
                                  query: `Explain this presentation (${file.originalName}) thoroughly slide-by-slide with real PM examples and architecture diagrams.`
                                })
                              }
                              className="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                              title="Explain this presentation in the AI Study Room"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                              <span>Explain PPT</span>
                            </button>

                            <button
                              onClick={() =>
                                onNavigateToQuiz({
                                  subjectId: activeSubject.id,
                                  fileId: file.id
                                })
                              }
                              className="px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                              title="Generate an instant quiz derived strictly from this presentation"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Take Quiz</span>
                            </button>
                          </>
                        )}

                        {isError && (
                          <button
                            onClick={() => handleReprocessFile(file.id)}
                            className="px-3 py-1.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-charcoal-900 text-xs font-bold"
                          >
                            Retry
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteFile(file.id, file.originalName)}
                          className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TOPICS & SYLLABUS */}
        {activeTab === 'topics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-charcoal-500">
                Track learning status for each syllabus topic in this course.
              </p>

              <button
                onClick={() => setIsAddTopicOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Syllabus Topic</span>
              </button>
            </div>

            {topics.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white border border-cream-300 text-xs text-charcoal-400">
                No syllabus topics listed yet. Add topics to track your exam readiness.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {topics.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-white border border-cream-300 hover:border-brand-200 transition-all flex items-center justify-between gap-3 shadow-soft"
                  >
                    <span className="text-xs md:text-sm font-bold text-charcoal-900 truncate">
                      {t.name}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTopicStatus(t.id, e.target.value)}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-700 cursor-pointer outline-hidden focus:border-brand-500"
                      >
                        <option value="not_started">⚪ Not Started</option>
                        <option value="in_progress">🔵 In Progress</option>
                        <option value="studied">🟢 Studied</option>
                        <option value="understood">⭐ Understood</option>
                        <option value="needs_revision">⚠️ Needs Revision</option>
                      </select>

                      <button
                        onClick={() =>
                          onNavigateToStudyRoom({
                            subjectId: activeSubject.id,
                            topicName: t.name
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                      >
                        Revise
                      </button>

                      <button
                        onClick={() => handleDeleteTopic(t.id)}
                        className="p-1.5 rounded-lg text-charcoal-300 hover:text-rose-500 transition-colors"
                        title="Delete topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create Subject */}
      {isCreateModalOpen && (
        <CreateSubjectModal
          name={newSubjectName}
          desc={newSubjectDesc}
          setName={setNewSubjectName}
          setDesc={setNewSubjectDesc}
          onSubmit={handleCreateSubject}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Modal: Add Topic */}
      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-cream-300 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <h3 className="text-sm font-bold text-charcoal-900">Add Syllabus Topic</h3>
              <button onClick={() => setIsAddTopicOpen(false)}>
                <X className="w-4 h-4 text-charcoal-400" />
              </button>
            </div>
            <form onSubmit={handleAddTopic} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Unit Economics & LTV/CAC"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                autoFocus
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs text-charcoal-900 focus:outline-hidden focus:border-brand-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddTopicOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preview Chunks */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-cream-300 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-charcoal-900 text-white">
              <div>
                <h4 className="text-xs md:text-sm font-bold truncate">{previewFile.file.originalName}</h4>
                <p className="text-[11px] text-charcoal-400">
                  {previewFile.chunks.length} extracted slide & page chunks
                </p>
              </div>
              <button onClick={() => setPreviewFile(null)}>
                <X className="w-4 h-4 text-charcoal-400 hover:text-white" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-3 flex-1 bg-cream-50">
              {previewFile.chunks.map((chunk, idx) => (
                <div key={chunk.id} className="p-4 rounded-2xl bg-white border border-cream-300/80 text-xs space-y-1.5 shadow-2xs">
                  <div className="text-[10px] font-bold text-brand-700 font-mono">
                    Chunk #{idx + 1} {chunk.slideNumber ? `(Slide ${chunk.slideNumber})` : chunk.pageNumber ? `(Page ${chunk.pageNumber})` : ''}
                  </div>
                  <p className="whitespace-pre-wrap text-charcoal-700 leading-relaxed font-sans">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CreateSubjectModalProps {
  name: string;
  desc: string;
  setName: (v: string) => void;
  setDesc: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  name,
  desc,
  setName,
  setDesc,
  onSubmit,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-cream-300 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-cream-200">
          <h3 className="text-sm font-bold text-charcoal-900">Add Academic Course</h3>
          <button onClick={onClose}>
            <X className="w-4 h-4 text-charcoal-400" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">Course Name</label>
            <input
              type="text"
              placeholder="e.g. Product Strategy & Execution"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs text-charcoal-900 focus:outline-hidden focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">Short Description</label>
            <textarea
              placeholder="e.g. Core MBA term 2 course."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs text-charcoal-900 focus:outline-hidden focus:border-brand-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-cream-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-colors shadow-2xs"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

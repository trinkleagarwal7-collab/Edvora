import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Target,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { api } from '../../api';
import { ProgressOverview, StudyTask, Subject } from '../../types';

interface ProgressPageProps {
  onNavigateToStudyRoom: (context: any) => void;
  onNavigateToQuiz: (context: any) => void;
  onNavigateToCourses: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  onNavigateToStudyRoom,
  onNavigateToQuiz,
  onNavigateToCourses
}) => {
  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New task form state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState<string>('');
  const [taskTargetDate, setTaskTargetDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [progData, subjsData, tasksData] = await Promise.all([
        api.getProgressOverview(),
        api.getSubjects(),
        api.getStudyTasks()
      ]);
      setProgress(progData);
      setSubjects(subjsData);
      setTasks(tasksData);
      if (subjsData.length > 0) {
        setTaskSubjectId(subjsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const newTask = await api.createStudyTask({
        title: taskTitle.trim(),
        subjectId: taskSubjectId || null,
        targetDate: taskTargetDate,
        priority: 'medium'
      });
      setTasks((prev) => [newTask, ...prev]);
      setTaskTitle('');
      setIsAddTaskOpen(false);
    } catch (err: any) {
      alert(`Task notice: ${err.message}`);
    }
  };

  const handleToggleTask = async (task: StudyTask) => {
    try {
      const updated = await api.updateStudyTask(task.id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteStudyTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium text-charcoal-500">Calculating syllabus coverage...</span>
      </div>
    );
  }

  if (!progress || progress.overall.totalSubjects === 0) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200/50 flex items-center justify-center text-brand-600 mx-auto shadow-xs">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-charcoal-900 tracking-tight">No Learning Progress Recorded Yet</h3>
          <p className="text-sm text-charcoal-500 max-w-md mx-auto leading-relaxed">
            Upload course slides, documents or notes in <strong>My Courses</strong> to let Edvora automatically map your syllabus and track mastery.
          </p>
        </div>
        <button
          onClick={onNavigateToCourses}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Go to My Courses</span>
        </button>
      </div>
    );
  }

  const { overall, subjectProgress, weakTopics } = progress;
  const totalFiles = subjects.reduce((sum, s) => sum + (s.fileCount || 0), 0);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-9 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Academic Performance & Mastery</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            My Learning Progress
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Real syllabus mastery, quiz accuracy, and revision needs calculated from your uploaded course slides.
          </p>
        </div>

        <button
          onClick={() => setIsAddTaskOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-xs hover:shadow-md transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Target</span>
        </button>
      </div>

      {/* 4 High-Yield Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Syllabus Covered */}
        <div className="p-5 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-3 relative overflow-hidden group hover:border-brand-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Syllabus Covered
            </span>
            <div className="w-8 h-8 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-charcoal-900 tracking-tight">
              {overall.overallMasteryPercent}%
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              {overall.understoodTopics} of {overall.totalTopics} topics understood
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${overall.overallMasteryPercent}%` }}
            />
          </div>
        </div>

        {/* Card 2: Average Quiz Score */}
        <div className="p-5 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-3 relative overflow-hidden group hover:border-brand-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Quiz Accuracy
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-charcoal-900 tracking-tight">
              {overall.avgQuizScore}%
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Across {overall.quizzesCompleted} quiz attempt{overall.quizzesCompleted === 1 ? '' : 's'}
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overall.avgQuizScore, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Topics to Revise */}
        <div className="p-5 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-3 relative overflow-hidden group hover:border-coral-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Needs Revision
            </span>
            <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-coral-600 tracking-tight">
              {overall.revisionTopics}
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Concepts flagged for exam review
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
            <div
              className="h-full bg-coral-500 rounded-full transition-all duration-500"
              style={{
                width: overall.totalTopics > 0
                  ? `${Math.min((overall.revisionTopics / overall.totalTopics) * 100, 100)}%`
                  : '0%'
              }}
            />
          </div>
        </div>

        {/* Card 4: Materials Uploaded */}
        <div className="p-5 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs space-y-3 relative overflow-hidden group hover:border-brand-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Study Materials
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-charcoal-900 tracking-tight">
              {totalFiles}
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Files in {overall.totalSubjects} MBA courses
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Course-by-Course Syllabus Mastery */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-charcoal-900">
              Course-by-Course Syllabus Mastery
            </h3>
            <p className="text-xs text-charcoal-500">
              Track how thoroughly you understand the key concepts in each individual subject.
            </p>
          </div>
          <button
            onClick={onNavigateToCourses}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Manage Courses</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectProgress.map((subj) => (
            <div
              key={subj.id}
              className="p-5 rounded-3xl bg-white border border-[#EBE7DF] shadow-xs hover:border-brand-300 transition-all space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[11px] font-bold">
                    MBA Subject
                  </span>
                  <h4 className="text-sm font-bold text-charcoal-900 truncate">
                    {subj.name}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-charcoal-900">
                    {subj.completionPercent}%
                  </span>
                  <span className="block text-[10px] text-charcoal-400 uppercase font-semibold">Mastery</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#F4F1EA] overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${subj.completionPercent}%` }}
                />
              </div>

              {/* Sub-metrics */}
              <div className="flex items-center justify-between text-xs text-charcoal-500 pt-1 border-t border-[#F5F2EB]">
                <div className="flex items-center gap-3">
                  <span>{subj.totalTopics} topics</span>
                  <span>•</span>
                  <span>{subj.fileCount} materials</span>
                </div>
                {subj.averageQuizScore !== null ? (
                  <span className="font-semibold text-charcoal-700">
                    Quiz avg: {subj.averageQuizScore}%
                  </span>
                ) : (
                  <span className="text-charcoal-400 italic">No quiz taken yet</span>
                )}
              </div>

              {/* Quick Action */}
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => onNavigateToStudyRoom({ subjectId: subj.id })}
                  className="flex-1 py-2 px-3 rounded-xl bg-cream-50 hover:bg-brand-50 text-charcoal-700 hover:text-brand-700 text-xs font-bold border border-[#EBE7DF] hover:border-brand-200 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Study Notes</span>
                </button>
                <button
                  onClick={() => onNavigateToQuiz({ subjectId: subj.id })}
                  className="flex-1 py-2 px-3 rounded-xl bg-cream-50 hover:bg-sage-50 text-charcoal-700 hover:text-sage-700 text-xs font-bold border border-[#EBE7DF] hover:border-sage-200 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-sage-600" />
                  <span>Practice Quiz</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Topics Needing Revision */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
            <span>Topics That Need Revision</span>
            {weakTopics.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-coral-50 text-coral-600 text-xs font-bold border border-coral-200">
                {weakTopics.length}
              </span>
            )}
          </h3>
          <p className="text-xs text-charcoal-500">
            Concepts where quiz accuracy was under 70% or flagged for review before exams.
          </p>
        </div>

        {weakTopics.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-[#EBE7DF] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-charcoal-900">All caught up! 🎉</p>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                No weak concepts detected right now. Take quizzes in <strong>Practice & Revision</strong> to stress-test your knowledge.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {weakTopics.map((w, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-coral-100 shadow-xs hover:border-coral-300 transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-coral-50 text-coral-700 text-[10px] font-bold uppercase tracking-wider">
                      {w.subjectName}
                    </span>
                    <span className="text-[11px] text-coral-600 font-medium">
                      {w.reason}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-900">
                    {w.topicName}
                  </h4>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-coral-50">
                  <button
                    onClick={() =>
                      onNavigateToStudyRoom({
                        subjectId: w.subjectId,
                        topicName: w.topicName
                      })
                    }
                    className="flex-1 py-1.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain with AI</span>
                  </button>
                  <button
                    onClick={() =>
                      onNavigateToQuiz({
                        subjectId: w.subjectId,
                        topicName: w.topicName
                      })
                    }
                    className="py-1.5 px-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F3EFE6] text-charcoal-700 text-xs font-bold border border-[#EBE7DF] transition-colors"
                  >
                    Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 4: Study Targets & Exam Deadlines */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-charcoal-900">
              Study Targets & Deadlines
            </h3>
            <p className="text-xs text-charcoal-500">
              Keep your MBA revision on track. Set concrete goals for each subject.
            </p>
          </div>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-[#EBE7DF] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-charcoal-900">No study deadlines scheduled</p>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                Add revision goals or exam dates to stay focused during your study sessions.
              </p>
            </div>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition-colors"
            >
              + Create First Target
            </button>
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-[#EBE7DF] shadow-xs divide-y divide-[#F5F2EB] overflow-hidden">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between gap-3 text-xs hover:bg-[#FAF9F5] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 cursor-pointer accent-brand-600"
                  />
                  <span
                    className={`truncate font-medium text-sm transition-all ${
                      task.completed
                        ? 'line-through text-charcoal-400'
                        : 'text-charcoal-900'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-charcoal-400">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-50 border border-[#EBE7DF] text-[11px] font-medium text-charcoal-600">
                    <Clock className="w-3 h-3 text-charcoal-400" />
                    <span>Due {task.targetDate}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 rounded-lg hover:text-coral-600 hover:bg-coral-50 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: Add Task */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EBE7DF] p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-charcoal-900">Add Study Target</h3>
              </div>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-[#F5F2EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700">Target or Revision Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Master CAC/LTV & Unit Economics formulas"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#EBE7DF] text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-hidden focus:border-brand-500 bg-[#FAF9F5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700">Related Course</label>
                  <select
                    value={taskSubjectId}
                    onChange={(e) => setTaskSubjectId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#EBE7DF] text-xs text-charcoal-900 bg-[#FAF9F5] focus:outline-hidden focus:border-brand-500"
                  >
                    <option value="">(General / All)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700">Target Completion Date</label>
                  <input
                    type="date"
                    value={taskTargetDate}
                    onChange={(e) => setTaskTargetDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#EBE7DF] text-xs text-charcoal-900 bg-[#FAF9F5] focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-[#F5F2EB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

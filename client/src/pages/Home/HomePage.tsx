import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckSquare,
  Zap,
  Upload,
  ArrowRight,
  Clock,
  Plus,
  FileText,
  Bookmark,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../../api';
import { Subject, ProgressOverview, ActivityLog } from '../../types';

interface HomePageProps {
  onNavigate: (tab: string, context?: any) => void;
  onOpenCreateSubject: () => void;
  onOpenUpload: (subjectId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenCreateSubject,
  onOpenUpload
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      const [subjsData, progData] = await Promise.all([
        api.getSubjects(),
        api.getProgressOverview()
      ]);
      setSubjects(subjsData);
      setProgress(progData);
      setRecentActivities(progData.recentActivities || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-charcoal-400">Opening your study space...</p>
      </div>
    );
  }

  // Find recently studied subject & last activity
  const lastStudyActivity = recentActivities.find(
    (a) => a.type === 'study' || a.type === 'quiz' || a.type === 'upload'
  );
  const lastSubject = lastStudyActivity?.subjectId
    ? subjects.find((s) => s.id === lastStudyActivity.subjectId)
    : subjects[0] || null;

  const hasActivity = subjects.length > 0 && lastSubject;

  // Aesthetic pastel colors for course cards
  const coursePastels = [
    { bg: 'bg-[#F4F1FD]', border: 'border-[#E7E2FA]', badge: 'text-[#6951B4] bg-white', pill: 'bg-[#7C65C1]' },
    { bg: 'bg-[#FFF2EE]', border: 'border-[#FFE3DA]', badge: 'text-[#C73B22] bg-white', pill: 'bg-[#FF6B52]' },
    { bg: 'bg-[#EFF8F4]', border: 'border-[#DCF0E6]', badge: 'text-[#047857] bg-white', pill: 'bg-[#10B981]' },
    { bg: 'bg-[#FDF6E9]', border: 'border-[#F8ECCB]', badge: 'text-[#B45309] bg-white', pill: 'bg-[#F59E0B]' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-9 animate-in fade-in duration-200 font-sans">
      {/* SECTION A: WELCOME (Friendly, clean, no oversized banners) */}
      <section className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>MBA Product Management Workspace</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-charcoal-900 tracking-tight">
          Hey, ready to make some progress today?
        </h2>
        <p className="text-xs md:text-sm text-charcoal-500 font-medium">
          Your personal academic library, lecture slide notes and AI professor are ready.
        </p>
      </section>

      {/* SECTION B: CONTINUE LEARNING ("Where did I leave off?") */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
            Continue Learning
          </h3>
          {lastSubject && (
            <span className="text-[11px] font-medium text-charcoal-400">
              Pick up right where you stopped
            </span>
          )}
        </div>

        {hasActivity ? (
          <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-br from-white via-white to-brand-50/40 border border-cream-300/80 shadow-soft card-hover flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-brand-100 text-brand-700 border border-brand-200/60">
                  {lastSubject.name}
                </span>
                <span className="text-[11px] text-charcoal-400 font-medium">
                  {lastSubject.fileCount || 0} material{lastSubject.fileCount === 1 ? '' : 's'}
                </span>
              </div>

              <div>
                <h4 className="text-lg md:text-xl font-extrabold text-charcoal-900 tracking-tight">
                  {lastStudyActivity?.title || lastSubject.name}
                </h4>
                <p className="text-xs md:text-[13px] text-charcoal-500 mt-0.5 line-clamp-1 leading-relaxed">
                  {lastStudyActivity?.description ||
                    lastSubject.description ||
                    'Review lecture slides, frameworks and concepts with your AI tutor.'}
                </p>
              </div>

              {/* Minimal aesthetic progress indicator */}
              <div className="pt-2 flex items-center gap-3">
                <div className="w-44 h-2 rounded-full bg-cream-200/80 overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-coral-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, lastSubject.progressPercent || 0)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-charcoal-700">
                  {lastSubject.progressPercent || 0}% syllabus covered
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
              <button
                onClick={() => onNavigate('tutor', { subjectId: lastSubject.id })}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold transition-all shadow-md active:scale-98 group"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('practice', { subjectId: lastSubject.id })}
                className="inline-flex items-center justify-center p-3 rounded-2xl bg-white hover:bg-cream-100 text-charcoal-700 border border-cream-300 text-xs font-bold transition-colors shadow-2xs"
                title="Practice quizzes for this subject"
              >
                <CheckSquare className="w-4 h-4 text-brand-600" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-cream-300 shadow-soft text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200/60">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-charcoal-900">Your study library is ready to begin</h4>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto leading-relaxed">
              Upload your faculty PPTs, lecture handouts or case studies to start your personal MBA study space.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenCreateSubject}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Subject</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION C: MY COURSES ("What am I studying?") */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
              My Courses
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cream-200 text-charcoal-600">
              {subjects.length} active
            </span>
          </div>

          <button
            onClick={() => onNavigate('courses')}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors group"
          >
            <span>View All Courses</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-cream-300 text-center text-xs text-charcoal-400">
            No subjects added yet. Click "+ Add Subject" to set up your courses.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.slice(0, 4).map((subj, idx) => {
              const theme = coursePastels[idx % coursePastels.length];
              return (
                <div
                  key={subj.id}
                  onClick={() => onNavigate('courses', { subjectId: subj.id })}
                  className={`p-5 rounded-3xl ${theme.bg} ${theme.border} border hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs card-hover`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.pill}`} />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badge} border border-black/5`}>
                        {subj.fileCount || 0} file{subj.fileCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-charcoal-900 group-hover:text-brand-800 transition-colors line-clamp-1">
                        {subj.name}
                      </h4>
                      <p className="text-[11px] text-charcoal-500 mt-1 line-clamp-2 leading-relaxed">
                        {subj.description || 'Uploaded course presentations and lecture notes.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-14 h-1.5 rounded-full bg-black/10 overflow-hidden">
                        <div
                          className="h-full bg-charcoal-900 rounded-full"
                          style={{ width: `${Math.max(10, subj.progressPercent || 0)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-charcoal-600">
                        {subj.progressPercent || 0}%
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-charcoal-900 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION D: QUICK ACTIONS ("What should I do next?") */}
      <section className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Action 1: Upload Notes */}
          <button
            onClick={() => onOpenUpload()}
            className="p-5 rounded-3xl bg-white border border-cream-300 hover:border-brand-300 text-left transition-all shadow-soft card-hover group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3 group-hover:bg-brand-600 group-hover:text-white transition-colors border border-brand-200/50">
              <Upload className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-900 group-hover:text-brand-700 transition-colors">
                Upload Notes
              </div>
              <div className="text-[11px] text-charcoal-400 mt-0.5">Add PPTs, PDFs & notes</div>
            </div>
          </button>

          {/* Action 2: Ask AI */}
          <button
            onClick={() => onNavigate('tutor')}
            className="p-5 rounded-3xl bg-white border border-cream-300 hover:border-coral-300 text-left transition-all shadow-soft card-hover group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-2xl bg-coral-50 text-coral-600 flex items-center justify-center mb-3 group-hover:bg-coral-500 group-hover:text-white transition-colors border border-coral-200/50">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-900 group-hover:text-coral-600 transition-colors">
                Ask AI Tutor
              </div>
              <div className="text-[11px] text-charcoal-400 mt-0.5">Explain difficult topics</div>
            </div>
          </button>

          {/* Action 3: Take a Quiz */}
          <button
            onClick={() => onNavigate('practice', { tab: 'quizzes' })}
            className="p-5 rounded-3xl bg-white border border-cream-300 hover:border-sage-300 text-left transition-all shadow-soft card-hover group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center mb-3 group-hover:bg-sage-600 group-hover:text-white transition-colors border border-sage-200/50">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-900 group-hover:text-sage-700 transition-colors">
                Take a Quiz
              </div>
              <div className="text-[11px] text-charcoal-400 mt-0.5">MCQs & instant grading</div>
            </div>
          </button>

          {/* Action 4: Quick Revision */}
          <button
            onClick={() => onNavigate('practice', { tab: 'revision' })}
            className="p-5 rounded-3xl bg-white border border-cream-300 hover:border-amber-300 text-left transition-all shadow-soft card-hover group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors border border-amber-200/50">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-900 group-hover:text-amber-700 transition-colors">
                Quick Revision
              </div>
              <div className="text-[11px] text-charcoal-400 mt-0.5">5-minute concept refresh</div>
            </div>
          </button>
        </div>
      </section>

      {/* SECTION E: RECENT ACTIVITY (Clean, hidden if no real activity) */}
      {recentActivities.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
              Recent Activity
            </h3>
            <span className="text-[11px] text-charcoal-400 font-medium">
              Real study logs
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-cream-300 shadow-soft divide-y divide-cream-200/70">
            {recentActivities.slice(0, 4).map((act) => (
              <div
                key={act.id}
                className="py-3 first:pt-1 last:pb-1 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-charcoal-900 truncate">{act.title}</p>
                    <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-charcoal-400 font-mono shrink-0 ml-4 bg-cream-200/60 px-2 py-0.5 rounded-md">
                  {new Date(act.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

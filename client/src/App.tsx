import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { HomePage } from './pages/Home/HomePage';
import { CoursesPage } from './pages/Courses/CoursesPage';
import { StudyRoomPage } from './pages/StudyRoom/StudyRoomPage';
import { PracticePage } from './pages/Practice/PracticePage';
import { ProgressPage } from './pages/Progress/ProgressPage';
import { EscapeRoomPage } from './pages/EscapeRoom/EscapeRoomPage';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SettingsModal } from './components/common/SettingsModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { api } from './api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [navigationContext, setNavigationContext] = useState<any>({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const subjects = await api.getSubjects();
      const hasSeenOnboarding = localStorage.getItem('edvora_onboarding_shown');
      if (subjects.length === 0 && !hasSeenOnboarding) {
        setIsOnboardingOpen(true);
        localStorage.setItem('edvora_onboarding_shown', 'true');
      }
    } catch (err) {
      console.warn('Initial onboarding check error:', err);
    }
  };

  const handleNavigate = (tab: string, context: any = {}) => {
    setCurrentTab(tab);
    setNavigationContext(context);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex bg-surface-ground text-charcoal-900 font-sans">
      {/* LORIS Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1">
          {currentTab === 'home' && (
            <HomePage
              onNavigate={(tab, ctx) => handleNavigate(tab, ctx)}
              onOpenCreateSubject={() => handleNavigate('courses')}
              onOpenUpload={(subjectId) => handleNavigate('courses', { subjectId })}
            />
          )}

          {currentTab === 'courses' && (
            <CoursesPage
              initialSubjectId={navigationContext.subjectId || null}
              onNavigateToStudyRoom={(ctx) => handleNavigate('tutor', ctx)}
              onNavigateToQuiz={(ctx) => handleNavigate('practice', { ...ctx, tab: 'quizzes' })}
            />
          )}

          {currentTab === 'tutor' && (
            <StudyRoomPage
              initialSubjectId={navigationContext.subjectId || null}
              initialFileId={navigationContext.fileId || null}
              initialQuery={navigationContext.query || navigationContext.topicName || ''}
              onNavigateToCourses={() => handleNavigate('courses')}
            />
          )}

          {currentTab === 'practice' && (
            <PracticePage
              initialSubjectId={navigationContext.subjectId || null}
              initialFileId={navigationContext.fileId || null}
              initialTab={navigationContext.tab || 'quizzes'}
              onNavigateToStudyRoom={(ctx) => handleNavigate('tutor', ctx)}
              onNavigateToCourses={() => handleNavigate('courses')}
            />
          )}

          {currentTab === 'escape-room' && (
            <EscapeRoomPage
              onNavigateToStudyRoom={(ctx) => handleNavigate('tutor', ctx)}
              onNavigateToCourses={() => handleNavigate('courses')}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressPage
              onNavigateToStudyRoom={(ctx) => handleNavigate('tutor', ctx)}
              onNavigateToQuiz={(ctx) => handleNavigate('practice', { ...ctx, tab: 'quizzes' })}
              onNavigateToCourses={() => handleNavigate('courses')}
            />
          )}
        </main>
      </div>

      {/* Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab, ctx) => handleNavigate(tab, ctx)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* First-time Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCreateSubject={() => handleNavigate('courses')}
      />
    </div>
  );
}

export default App;

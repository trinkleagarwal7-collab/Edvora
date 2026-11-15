import React from 'react';
import { Menu, Search, Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenSearch,
  onOpenSettings
}) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    home: { title: 'Home', subtitle: 'Personal study dashboard' },
    courses: { title: 'My Courses', subtitle: 'Academic library & course notes' },
    tutor: { title: 'AI Study Room', subtitle: 'Personal AI professor & grounded explanations' },
    practice: { title: 'Practice & Revision', subtitle: 'Interactive quizzes, flashcards & quick revision' },
    'escape-room': { title: 'The Exam Escape Room', subtitle: '3D academic knowledge challenge & mystery chambers' },
    progress: { title: 'My Progress', subtitle: 'Syllabus mastery & exam readiness' }
  };

  const current = titles[currentTab] || { title: 'Edvora', subtitle: 'MBA study companion' };

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 h-16 bg-cream-100/90 backdrop-blur-md border-b border-cream-300/60 px-4 md:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-charcoal-600 hover:bg-white md:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm md:text-base font-bold text-charcoal-900 tracking-tight leading-tight">
            {current.title}
          </h1>
          <p className="hidden sm:block text-[11px] text-charcoal-400 font-medium -mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-xs">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-cream-300/80 text-charcoal-500 font-medium text-[11px] shadow-2xs">
          <span>📅</span>
          <span>{todayStr}</span>
        </span>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-charcoal-600 hover:text-charcoal-900 bg-white hover:bg-cream-50 border border-cream-300/80 transition-all shadow-2xs"
          title="Search library (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-charcoal-400" />
          <span className="hidden md:inline font-medium text-[11px]">Search</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 bg-white hover:bg-cream-50 border border-cream-300/80 transition-all shadow-2xs"
          title="Settings & API Key"
        >
          <Settings className="w-4 h-4 text-charcoal-500" />
        </button>
      </div>
    </header>
  );
};

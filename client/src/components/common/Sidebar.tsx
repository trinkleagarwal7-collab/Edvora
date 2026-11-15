import React from 'react';
import {
  Home,
  BookOpen,
  Sparkles,
  CheckSquare,
  BarChart3,
  Settings,
  Search,
  Sparkle,
  Compass,
  KeyRound
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenSearch,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: null },
    { id: 'courses', label: 'My Courses', icon: BookOpen, badge: null },
    { id: 'tutor', label: 'AI Study Room', icon: Sparkles, badge: 'AI' },
    { id: 'practice', label: 'Practice & Revision', icon: CheckSquare, badge: null },
    { id: 'escape-room', label: 'Exam Escape Room', icon: KeyRound, badge: '3D' },
    { id: 'progress', label: 'My Progress', icon: BarChart3, badge: null }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-950/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-cream-50/90 backdrop-blur-md border-r border-cream-300/70 flex flex-col justify-between transition-transform duration-250 ease-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-18 flex items-center px-6 border-b border-cream-200/80 gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 border border-brand-300/70 flex items-center justify-center text-brand-700 shadow-xs">
              <Sparkles className="w-4.5 h-4.5 text-brand-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-charcoal-900 font-sans">
                  Edvora
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 tracking-wide uppercase">
                  MBA
                </span>
              </div>
              <p className="text-[11px] text-charcoal-400 font-medium -mt-0.5">Study Companion</p>
            </div>
          </div>

          {/* Minimal Notion-like Search Bar */}
          <div className="px-4 mt-5">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white hover:bg-cream-200/60 text-charcoal-400 hover:text-charcoal-700 border border-cream-300/80 text-xs transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-brand-600 transition-colors" />
                <span className="font-medium text-charcoal-500">Search library...</span>
              </div>
              <kbd className="text-[10px] bg-cream-200/70 px-1.5 py-0.5 rounded-md border border-cream-300 text-charcoal-500 font-mono font-medium">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* 5 Clean Navigation Links */}
          <nav className="px-3 mt-6 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-white text-charcoal-900 font-bold shadow-soft border border-brand-200/70 text-brand-700'
                      : 'text-charcoal-600 hover:bg-white/70 hover:text-charcoal-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-cream-200/50 text-charcoal-500 group-hover:bg-cream-200 group-hover:text-charcoal-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider uppercase ${
                        isActive
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-cream-200 text-charcoal-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Bar: Settings & Friendly Status */}
        <div className="p-4 border-t border-cream-200/80 space-y-2">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 hover:bg-white/80 transition-colors"
          >
            <Settings className="w-4 h-4 text-charcoal-400" />
            <span>Settings & AI Keys</span>
          </button>

          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-brand-50 to-coral-50 border border-brand-200/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
            <p className="text-[11px] font-medium text-charcoal-600 truncate">
              Grounded in your MBA notes
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

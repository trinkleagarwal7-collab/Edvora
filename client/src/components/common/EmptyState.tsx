import React from 'react';
import { LucideIcon, FolderPlus } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderPlus,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold transition-all duration-150 shadow-sm active:scale-98"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

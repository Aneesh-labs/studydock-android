import React from 'react';
import { cn } from '../../lib/utils';
import { Priority } from '../../types/journal';
import { DeadlineCategory } from '../../types/deadline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'priority' | 'category' | 'status';
  priority?: Priority;
  category?: DeadlineCategory;
  urgency?: 'critical' | 'urgent' | 'medium' | 'low';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  priority,
  category,
  urgency,
  ...props
}) => {
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700/60';

  if (priority === 'high') {
    colorClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  } else if (priority === 'medium') {
    colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (priority === 'low') {
    colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }

  if (category) {
    const categoryColors: Record<DeadlineCategory, string> = {
      exam: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      quiz: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      project: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      assignment: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      homework: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      lab: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      other: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    };
    colorClasses = categoryColors[category] || colorClasses;
  }

  if (urgency) {
    if (urgency === 'critical') colorClasses = 'bg-rose-600/25 text-rose-300 border-rose-500/40 animate-pulse';
    else if (urgency === 'urgent') colorClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    else if (urgency === 'medium') colorClasses = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    else colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border select-none',
        colorClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

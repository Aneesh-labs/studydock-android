import React, { useState } from 'react';
import { PlusCircle, Clock, BookOpen, Flame, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Deadline } from '../../types/deadline';
import { JournalEntry } from '../../types/journal';
import { calculateCountdown } from '../../services/engine/deadlineEngine';
import { StudyStats, formatLocalDate } from '../../services/engine/streakEngine';

export interface HomeViewProps {
  onQuickLogStudy: () => void;
  onQuickAddDeadline: () => void;
  onNavigateTab: (tab: 'journal' | 'deadlines' | 'insights') => void;
  onCompleteDeadline: (id: string) => void;
  upcomingDeadlines: Deadline[];
  todayEntries: JournalEntry[];
  stats: StudyStats;
  userName?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onQuickLogStudy,
  onQuickAddDeadline,
  onNavigateTab,
  onCompleteDeadline,
  upcomingDeadlines,
  todayEntries,
  stats,
  userName = 'Student',
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Generate 7-day strip (3 days before, today, 3 days after)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 3;
    const d = new Date();
    d.setDate(today.getDate() + offset);
    return {
      offset,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      dateString: formatLocalDate(d),
      isToday: offset === 0,
    };
  });

  // Calculate completion percentage
  const totalTasksToday = upcomingDeadlines.length + todayEntries.length;
  const completedToday = todayEntries.length;
  const completionPercent = totalTasksToday > 0 ? Math.min(100, Math.round((completedToday / totalTasksToday) * 100)) : 100;

  // Circular progress SVG values
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header: Greeting, Date & Streak Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">
            Welcome, {userName}
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">{dateStr}</p>
        </div>

        {/* Streak Pill */}
        <button
          onClick={() => onNavigateTab('insights')}
          className="glass-pill px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-amber-300 border border-amber-500/20 active:scale-95 transition-all shadow-sm"
        >
          <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold">{stats.currentStreak}d streak</span>
        </button>
      </div>

      {/* Progress & Quick Momentum Overview Card */}
      <Card className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-purple-950/30 border-indigo-500/20">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Daily Focus Progress</span>
            <h3 className="text-sm font-bold text-slate-100">
              {todayEntries.length > 0
                ? `${todayEntries.length} study session${todayEntries.length === 1 ? '' : 's'} logged today`
                : 'Ready to start today\'s study session?'}
            </h3>
            <p className="text-xs text-slate-400">
              {upcomingDeadlines.length} active deadline{upcomingDeadlines.length === 1 ? '' : 's'} remaining
            </p>
          </div>

          {/* Progress Ring */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="text-slate-800"
                strokeWidth="5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="text-indigo-500 transition-all duration-700 ease-out"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-extrabold text-slate-100">
              {completionPercent}%
            </span>
          </div>
        </div>
      </Card>

      {/* Calendar 7-Day Selector Strip */}
      <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-2xl glass-panel">
        {weekDays.map((wd) => {
          const isSelected = selectedDayOffset === wd.offset;
          return (
            <button
              key={wd.offset}
              onClick={() => setSelectedDayOffset(wd.offset)}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-glow-indigo'
                  : wd.isToday
                  ? 'bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-[10px] uppercase font-medium">{wd.dayName}</span>
              <span className="text-xs font-bold mt-0.5">{wd.dayNumber}</span>
              {wd.isToday && (
                <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Primary Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onQuickLogStudy}
          className="h-14 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-glow-indigo text-left flex items-center justify-between px-4 rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-100" />
            <div>
              <div className="text-xs font-bold text-white">Log Study</div>
              <div className="text-[10px] text-indigo-200">Quick capture</div>
            </div>
          </div>
          <PlusCircle className="w-4 h-4 text-indigo-200" />
        </Button>

        <Button
          onClick={onQuickAddDeadline}
          variant="secondary"
          className="h-14 text-left flex items-center justify-between px-4 rounded-2xl glass-card hover:bg-slate-800/80 border-slate-700/60"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-violet-400" />
            <div>
              <div className="text-xs font-bold text-slate-100">Add Deadline</div>
              <div className="text-[10px] text-slate-400">Exam or task</div>
            </div>
          </div>
          <PlusCircle className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      {/* Upcoming Deadlines Sentinel Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Upcoming Deadlines</h3>
            {upcomingDeadlines.length > 0 && (
              <span className="text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                {upcomingDeadlines.length}
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateTab('deadlines')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <Card className="text-center py-6 bg-slate-900/40 border-dashed border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">All caught up!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">No upcoming deadlines on your radar.</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {upcomingDeadlines.slice(0, 3).map((dl) => {
              const countdown = calculateCountdown(dl.dueAt);
              const urgencyBorder = countdown.isOverdue
                ? 'border-l-rose-500'
                : countdown.urgency === 'critical' || countdown.urgency === 'urgent'
                ? 'border-l-amber-500'
                : countdown.urgency === 'medium'
                ? 'border-l-yellow-500'
                : 'border-l-indigo-500';

              return (
                <Card
                  key={dl.id}
                  className={`p-3.5 hover:border-slate-700 transition-colors border-l-4 ${urgencyBorder}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge category={dl.category}>{dl.category}</Badge>
                        <Badge priority={dl.priority}>{dl.priority}</Badge>
                        <span className="text-[11px] font-semibold text-slate-400 truncate">
                          {dl.subject}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 truncate">{dl.title}</h4>
                      {dl.notes && (
                        <p className="text-xs text-slate-400 line-clamp-1">{dl.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge urgency={countdown.urgency}>
                        {countdown.label}
                      </Badge>
                      <button
                        onClick={() => onCompleteDeadline(dl.id)}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-colors"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's Study Log Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Today's Notes</h3>
            {todayEntries.length > 0 && (
              <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {todayEntries.length}
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateTab('journal')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
          >
            Open journal <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayEntries.length === 0 ? (
          <Card className="text-center py-6 bg-slate-900/40 border-dashed border-slate-800">
            <BookOpen className="w-8 h-8 text-indigo-400/50 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No notes recorded today</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Capture what you learned or reviewed today.</p>
            <Button
              size="sm"
              variant="glass"
              onClick={onQuickLogStudy}
              className="mt-3 text-xs"
            >
              + Log first note
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayEntries.map((entry) => (
              <Card key={entry.id} className="p-3 bg-slate-900/50 border-l-4 border-l-emerald-500">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono text-indigo-300">
                        [{entry.timeStr}]
                      </span>
                      {entry.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-400 font-mono">
                          #{t}
                        </span>
                      ))}
                      {entry.priority && (
                        <Badge priority={entry.priority} className="text-[10px] py-0 px-1.5">
                          {entry.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{entry.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


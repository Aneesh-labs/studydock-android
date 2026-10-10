import React from 'react';
import { Flame, Trophy, BookOpen, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StudyStats } from '../../services/engine/streakEngine';
import { Deadline } from '../../types/deadline';

export interface InsightsViewProps {
  stats: StudyStats;
  deadlines: Deadline[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({ stats, deadlines }) => {
  const completedDeadlines = deadlines.filter((d) => d.status === 'completed').length;
  const activeDeadlines = deadlines.filter((d) => d.status === 'active').length;

  const maxCount = Math.max(...stats.last7Days.map((d) => d.count), 1);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Study Insights</h2>
        <p className="text-xs text-slate-400">Personal study momentum & learning habits</p>
      </div>

      {/* Streak Hero Card */}
      <Card className="p-4 bg-gradient-to-br from-amber-500/15 via-slate-900/80 to-indigo-500/15 border-amber-500/30">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" /> Current Momentum
            </span>
            <div className="text-3xl font-black text-slate-100 flex items-baseline gap-1.5">
              {stats.currentStreak}
              <span className="text-sm font-semibold text-slate-400">
                {stats.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {stats.currentStreak > 0
                ? 'Consistency is your superpower. Keep it going today!'
                : 'Log a study note today to start your new streak!'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl glass-panel text-center min-w-[75px]">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold">Best Streak</span>
            <span className="text-sm font-bold text-slate-100">{stats.maxStreak} d</span>
          </div>
        </div>
      </Card>

      {/* 4-Stat Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Active Days</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{stats.totalDaysActive}</div>
          <p className="text-[10px] text-slate-500">Days with study logs</p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Total Notes</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{stats.totalEntries}</div>
          <p className="text-[10px] text-slate-500">{stats.totalWords} words recorded</p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Deadlines Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{completedDeadlines}</div>
          <p className="text-[10px] text-slate-500">Completed assignments</p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Outstanding</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{activeDeadlines}</div>
          <p className="text-[10px] text-slate-500">Active on radar</p>
        </Card>
      </div>

      {/* 7-Day Activity Chart */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Last 7 Days Activity
        </h3>

        <div className="flex items-end justify-between gap-2 h-28 pt-2">
          {stats.last7Days.map((d) => {
            const heightPercent = d.count > 0 ? Math.max(15, (d.count / maxCount) * 100) : 6;
            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono text-slate-400">
                  {d.count > 0 ? d.count : ''}
                </span>
                <div className="w-full max-w-[28px] bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      d.count > 0
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-glow-indigo'
                        : 'bg-slate-800/40'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{d.dayLabel}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Topics / Subjects */}
      {stats.topTags.length > 0 && (
        <Card className="p-4 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Top Study Topics
          </h3>
          <div className="space-y-2">
            {stats.topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">#{tag}</span>
                <span className="font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {count} {count === 1 ? 'note' : 'notes'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

import { JournalEntry } from '../../types/journal';

export interface StudyStats {
  totalDaysActive: number;
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  maxStreak: number;
  topTags: [string, number][];
  last7Days: { dateStr: string; dayLabel: string; count: number }[];
}

export function calculateStudyStats(entries: JournalEntry[], referenceDate: Date = new Date()): StudyStats {
  const activeDatesSet = new Set<string>();
  const tagCounter: Record<string, number> = {};
  let totalWords = 0;

  for (const entry of entries) {
    if (entry.studyDate) {
      activeDatesSet.add(entry.studyDate);
    }
    const words = entry.body.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;

    for (const tag of entry.tags) {
      const normalized = tag.toLowerCase().trim();
      if (normalized) {
        tagCounter[normalized] = (tagCounter[normalized] || 0) + 1;
      }
    }
  }

  const sortedActiveDates = Array.from(activeDatesSet).sort();

  // Streak calculation
  let currentStreak = 0;
  let maxStreak = 0;

  if (sortedActiveDates.length > 0) {
    const todayStr = formatLocalDate(referenceDate);
    const yesterday = new Date(referenceDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);

    let checkDate: Date;
    if (activeDatesSet.has(todayStr)) {
      checkDate = new Date(referenceDate);
    } else if (activeDatesSet.has(yesterdayStr)) {
      checkDate = yesterday;
    } else {
      checkDate = new Date(0); // broken streak
    }

    if (checkDate.getTime() > 0) {
      let iter = new Date(checkDate);
      while (activeDatesSet.has(formatLocalDate(iter))) {
        currentStreak++;
        iter.setDate(iter.getDate() - 1);
      }
    }

    // Maximum consecutive streak
    let runningStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedActiveDates) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const curDate = new Date(y, m - 1, d);

      if (!prevDate) {
        runningStreak = 1;
      } else {
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runningStreak++;
        } else if (diffDays > 1) {
          runningStreak = 1;
        }
      }

      if (runningStreak > maxStreak) {
        maxStreak = runningStreak;
      }
      prevDate = curDate;
    }
  }

  // Top 5 tags
  const topTags = Object.entries(tagCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Last 7 days distribution
  const last7Days: { dateStr: string; dayLabel: string; count: number }[] = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayLabel = daysOfWeek[d.getDay()];
    const count = entries.filter(e => e.studyDate === dateStr).length;

    last7Days.push({
      dateStr,
      dayLabel,
      count,
    });
  }

  return {
    totalDaysActive: activeDatesSet.size,
    totalEntries: entries.length,
    totalWords,
    currentStreak,
    maxStreak,
    topTags,
    last7Days,
  };
}

export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

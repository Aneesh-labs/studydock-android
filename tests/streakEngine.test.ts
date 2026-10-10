import { describe, it, expect } from 'vitest';
import { calculateStudyStats } from '../src/services/engine/streakEngine';
import { JournalEntry } from '../src/types/journal';

describe('Streak & Analytics Engine', () => {
  const refDate = new Date(2026, 9, 10); // Oct 10, 2026

  it('calculates current streak of 3 consecutive days correctly', () => {
    const entries: JournalEntry[] = [
      {
        id: '1',
        studyDate: '2026-10-10',
        timeStr: '10:00 AM',
        body: 'Studied Biology Cell Structure',
        tags: ['biology'],
        createdAt: '2026-10-10T10:00:00.000Z',
        updatedAt: '2026-10-10T10:00:00.000Z',
      },
      {
        id: '2',
        studyDate: '2026-10-09',
        timeStr: '04:00 PM',
        body: 'Reviewed Chemistry Acids and Bases',
        tags: ['chemistry'],
        createdAt: '2026-10-09T16:00:00.000Z',
        updatedAt: '2026-10-09T16:00:00.000Z',
      },
      {
        id: '3',
        studyDate: '2026-10-08',
        timeStr: '08:00 PM',
        body: 'Practiced Computer Science Trees',
        tags: ['cs', 'algorithms'],
        createdAt: '2026-10-08T20:00:00.000Z',
        updatedAt: '2026-10-08T20:00:00.000Z',
      },
    ];

    const stats = calculateStudyStats(entries, refDate);
    expect(stats.totalDaysActive).toBe(3);
    expect(stats.totalEntries).toBe(3);
    expect(stats.currentStreak).toBe(3);
    expect(stats.maxStreak).toBe(3);
  });

  it('maintains streak if user has not studied today yet but studied yesterday', () => {
    const entries: JournalEntry[] = [
      {
        id: '1',
        studyDate: '2026-10-09',
        timeStr: '04:00 PM',
        body: 'Studied yesterday',
        tags: ['math'],
        createdAt: '2026-10-09T16:00:00.000Z',
        updatedAt: '2026-10-09T16:00:00.000Z',
      },
      {
        id: '2',
        studyDate: '2026-10-08',
        timeStr: '08:00 PM',
        body: 'Studied two days ago',
        tags: ['math'],
        createdAt: '2026-10-08T20:00:00.000Z',
        updatedAt: '2026-10-08T20:00:00.000Z',
      },
    ];

    const stats = calculateStudyStats(entries, refDate);
    expect(stats.currentStreak).toBe(2);
  });

  it('resets streak to 0 if gap is greater than 1 day', () => {
    const entries: JournalEntry[] = [
      {
        id: '1',
        studyDate: '2026-10-07',
        timeStr: '10:00 AM',
        body: 'Old study entry',
        tags: ['physics'],
        createdAt: '2026-10-07T10:00:00.000Z',
        updatedAt: '2026-10-07T10:00:00.000Z',
      },
    ];

    const stats = calculateStudyStats(entries, refDate);
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(1);
  });

  it('counts top tags and words accurately', () => {
    const entries: JournalEntry[] = [
      {
        id: '1',
        studyDate: '2026-10-10',
        timeStr: '10:00 AM',
        body: 'One two three four five',
        tags: ['biology', 'exam'],
        createdAt: '2026-10-10T10:00:00.000Z',
        updatedAt: '2026-10-10T10:00:00.000Z',
      },
      {
        id: '2',
        studyDate: '2026-10-10',
        timeStr: '11:00 AM',
        body: 'Six seven eight',
        tags: ['biology'],
        createdAt: '2026-10-10T11:00:00.000Z',
        updatedAt: '2026-10-10T11:00:00.000Z',
      },
    ];

    const stats = calculateStudyStats(entries, refDate);
    expect(stats.totalWords).toBe(8);
    expect(stats.topTags[0]).toEqual(['biology', 2]);
    expect(stats.topTags[1]).toEqual(['exam', 1]);
  });
});

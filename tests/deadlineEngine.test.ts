import { describe, it, expect } from 'vitest';
import { calculateCountdown, calculateMilestones, generateStableNotificationId } from '../src/services/engine/deadlineEngine';

describe('Deadline Engine', () => {
  const refDate = new Date('2026-10-10T12:00:00.000Z');

  it('calculates future countdown in days and hours', () => {
    const futureDue = '2026-10-12T16:30:00.000Z'; // +2 days 4.5 hours
    const result = calculateCountdown(futureDue, refDate);
    expect(result.isOverdue).toBe(false);
    expect(result.label).toBe('2d 4h left');
    expect(result.urgency).toBe('low');
  });

  it('calculates urgent countdown when under 2 hours', () => {
    const soonDue = '2026-10-10T13:15:00.000Z'; // +1 hour 15 min
    const result = calculateCountdown(soonDue, refDate);
    expect(result.isOverdue).toBe(false);
    expect(result.label).toBe('1h 15m left');
    expect(result.urgency).toBe('urgent');
  });

  it('calculates overdue countdown accurately without deleting', () => {
    const pastDue = '2026-10-09T10:00:00.000Z'; // 26 hours ago
    const result = calculateCountdown(pastDue, refDate);
    expect(result.isOverdue).toBe(true);
    expect(result.label).toBe('Overdue by 1d 2h');
    expect(result.urgency).toBe('critical');
  });

  it('generates future milestone triggers for 48h, 24h, 2h, and due', () => {
    const dueStr = '2026-10-13T12:00:00.000Z'; // +72 hours
    const milestones = calculateMilestones('dl_test_1', dueStr, ['48h', '24h', '2h', 'due'], refDate);
    
    expect(milestones.length).toBe(4);
    expect(milestones.map((m) => m.milestone)).toEqual(['48h', '24h', '2h', 'due']);
  });

  it('filters out past milestones when deadline is within 24 hours', () => {
    const dueStr = '2026-10-11T00:00:00.000Z'; // +12 hours
    const milestones = calculateMilestones('dl_test_2', dueStr, ['48h', '24h', '2h', 'due'], refDate);
    
    // 48h and 24h are in the past; only 2h and due remain
    expect(milestones.map((m) => m.milestone)).toEqual(['2h', 'due']);
  });

  it('generates consistent, positive 31-bit integer notification IDs', () => {
    const id1 = generateStableNotificationId('deadline_123', '24h');
    const id2 = generateStableNotificationId('deadline_123', '24h');
    const id3 = generateStableNotificationId('deadline_123', '2h');

    expect(id1).toBe(id2);
    expect(id1).not.toBe(id3);
    expect(id1).toBeGreaterThan(0);
    expect(id1).toBeLessThan(2147483647);
  });
});

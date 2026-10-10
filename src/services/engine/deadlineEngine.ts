import { ReminderMilestone } from '../../types/reminder';

export interface CountdownInfo {
  label: string;
  isOverdue: boolean;
  urgency: 'critical' | 'urgent' | 'medium' | 'low';
  totalMinutesRemaining: number;
}

export function calculateCountdown(dueAtStr: string, referenceDate: Date = new Date()): CountdownInfo {
  const dueDt = new Date(dueAtStr);
  const diffMs = dueDt.getTime() - referenceDate.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = totalSeconds / 3600;

  if (totalSeconds < 0) {
    const overdueSec = Math.abs(totalSeconds);
    const overdueMins = Math.floor(overdueSec / 60);
    const overdueHours = Math.floor(overdueSec / 3600);
    const overdueDays = Math.floor(overdueHours / 24);

    let label: string;
    if (overdueDays > 0) {
      label = `Overdue by ${overdueDays}d ${overdueHours % 24}h`;
    } else if (overdueHours > 0) {
      label = `Overdue by ${overdueHours}h ${overdueMins % 60}m`;
    } else {
      label = `Overdue by ${Math.max(1, overdueMins)}m`;
    }

    return {
      label,
      isOverdue: true,
      urgency: 'critical',
      totalMinutesRemaining: totalMinutes,
    };
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  let label: string;
  if (days > 0) {
    label = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    label = `${hours}h ${mins}m left`;
  } else {
    label = `${Math.max(1, mins)}m left`;
  }

  let urgency: 'critical' | 'urgent' | 'medium' | 'low';
  if (totalHours <= 2) {
    urgency = 'urgent';
  } else if (totalHours <= 24) {
    urgency = 'medium';
  } else {
    urgency = 'low';
  }

  return {
    label,
    isOverdue: false,
    urgency,
    totalMinutesRemaining: totalMinutes,
  };
}

export interface MilestoneSchedule {
  milestone: ReminderMilestone;
  triggerAt: Date;
  notificationId: number;
}

export function calculateMilestones(
  deadlineId: string,
  dueAtStr: string,
  enabledMilestones: ReminderMilestone[] = ['48h', '24h', '2h', 'due'],
  referenceDate: Date = new Date()
): MilestoneSchedule[] {
  const dueDt = new Date(dueAtStr);
  const dueMs = dueDt.getTime();
  const nowMs = referenceDate.getTime();

  const schedules: MilestoneSchedule[] = [];

  const milestoneOffsets: Record<ReminderMilestone, number> = {
    '48h': 48 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '2h': 2 * 60 * 60 * 1000,
    'due': 0,
  };

  for (const milestone of enabledMilestones) {
    const offset = milestoneOffsets[milestone];
    const triggerMs = dueMs - offset;

    // Only schedule milestones strictly in the future (at least 15s buffer)
    if (triggerMs > nowMs + 15000) {
      schedules.push({
        milestone,
        triggerAt: new Date(triggerMs),
        notificationId: generateStableNotificationId(deadlineId, milestone),
      });
    }
  }

  return schedules;
}

export function generateStableNotificationId(deadlineId: string, milestone: string): number {
  const combined = `${deadlineId}_${milestone}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Return positive 31-bit integer
  return Math.abs(hash) % 2147483647;
}

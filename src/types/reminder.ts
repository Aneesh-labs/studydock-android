export type ReminderMilestone = '48h' | '24h' | '2h' | 'due';

export interface ReminderEvent {
  id: string; // generated: deadlineId_milestone
  notificationId: number; // 32-bit integer for Capacitor LocalNotifications
  deadlineId: string;
  milestone: ReminderMilestone;
  scheduledAt: string; // ISO-8601 string
  deliveredAt?: string;
  cancelledAt?: string;
  status: 'pending' | 'delivered' | 'cancelled';
}

import { LocalNotifications, ScheduleOptions, PermissionStatus } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Deadline } from '../../types/deadline';
import { calculateMilestones } from '../engine/deadlineEngine';
import { AppSettings } from '../../types/settings';
import { db } from '../database/db';

export const notificationService = {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  async requestPermissions(): Promise<boolean> {
    if (!this.isNative()) {
      return true;
    }
    try {
      const status: PermissionStatus = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (e) {
      console.warn('[Notifications] Error requesting permission:', e);
      return false;
    }
  },

  async checkPermissions(): Promise<boolean> {
    if (!this.isNative()) {
      return true;
    }
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    } catch (e) {
      return false;
    }
  },

  async reconcileDeadlineReminders(deadline: Deadline, settings: AppSettings): Promise<void> {
    // 1. Cancel existing reminders for this deadline
    await this.cancelDeadlineReminders(deadline.id);

    // If deadline is not active or notifications are disabled, stop here
    if (deadline.status !== 'active' || !settings.notificationsEnabled) {
      return;
    }

    // 2. Compute future milestones
    const schedules = calculateMilestones(
      deadline.id,
      deadline.dueAt,
      settings.enabledMilestones
    );

    if (schedules.length === 0) {
      return;
    }

    const notificationsToSchedule: ScheduleOptions['notifications'] = [];

    for (const item of schedules) {
      const milestoneLabels: Record<string, string> = {
        '48h': `Upcoming in 48 hours: ${deadline.title}`,
        '24h': `Due tomorrow: ${deadline.title}`,
        '2h': `Due soon (2 hours left): ${deadline.title}`,
        'due': `Deadline is DUE now: ${deadline.title}`,
      };

      const title = milestoneLabels[item.milestone] || `Deadline Alert: ${deadline.title}`;
      const body = `${deadline.subject} • ${deadline.category.toUpperCase()} (${deadline.priority.toUpperCase()} priority)`;

      notificationsToSchedule.push({
        id: item.notificationId,
        title,
        body,
        schedule: { at: item.triggerAt },
        extra: {
          deadlineId: deadline.id,
          milestone: item.milestone,
        },
      });

      // Record in local DB
      await db.reminders.put({
        id: `${deadline.id}_${item.milestone}`,
        notificationId: item.notificationId,
        deadlineId: deadline.id,
        milestone: item.milestone,
        scheduledAt: item.triggerAt.toISOString(),
        status: 'pending',
      });
    }

    if (this.isNative() && notificationsToSchedule.length > 0) {
      try {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      } catch (err) {
        console.warn('[Notifications] Failed to schedule native local notifications:', err);
      }
    }
  },

  async cancelDeadlineReminders(deadlineId: string): Promise<void> {
    const existing = await db.reminders.where('deadlineId').equals(deadlineId).toArray();
    
    if (existing.length > 0) {
      if (this.isNative()) {
        try {
          await LocalNotifications.cancel({
            notifications: existing.map(r => ({ id: r.notificationId })),
          });
        } catch (e) {
          console.warn('[Notifications] Error cancelling native notifications:', e);
        }
      }

      await db.reminders.where('deadlineId').equals(deadlineId).delete();
    }
  },

  async sendTestNotification(): Promise<boolean> {
    const perm = await this.requestPermissions();
    if (!perm) return false;

    if (this.isNative()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 999999,
              title: '🔔 StudyDock Test Alert',
              body: 'Your local notifications are working perfectly on Android!',
              schedule: { at: new Date(Date.now() + 1000) },
            },
          ],
        });
        return true;
      } catch (err) {
        console.error('[Notifications] Test failed:', err);
        return false;
      }
    }
    return true;
  },
};

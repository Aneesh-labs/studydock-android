import { ReminderMilestone } from './reminder';

export interface AppSettings {
  id: string; // 'current'
  userName: string;
  theme: 'dark' | 'light' | 'system';
  enabledMilestones: ReminderMilestone[];
  notificationsEnabled: boolean;
  defaultTag: string;
  defaultPriority: 'low' | 'medium' | 'high';
  timeFormat: '12h' | '24h';
  weekStartsOn: 0 | 1; // 0: Sunday, 1: Monday
  schemaVersion: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'current',
  userName: 'Student',
  theme: 'dark',
  enabledMilestones: ['48h', '24h', '2h', 'due'],
  notificationsEnabled: true,
  defaultTag: 'general',
  defaultPriority: 'medium',
  timeFormat: '12h',
  weekStartsOn: 1,
  schemaVersion: 1,
};

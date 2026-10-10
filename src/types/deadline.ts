import { Priority } from './journal';

export type DeadlineCategory = 'homework' | 'assignment' | 'exam' | 'lab' | 'project' | 'quiz' | 'other';
export type DeadlineStatus = 'active' | 'completed' | 'archived';

export interface Deadline {
  id: string;
  title: string;
  subject: string;
  category: DeadlineCategory;
  dueAt: string; // ISO-8601 string: 2026-10-15T23:59:00.000
  priority: Priority;
  notes?: string;
  submissionUrl?: string;
  status: DeadlineStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyDeadline {
  id: string | number;
  title: string;
  subject?: string;
  due: string; // YYYY-MM-DD HH:MM
  category?: string;
  priority?: string;
  notes?: string;
  notified_milestones?: string[];
  completed?: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export interface JournalEntry {
  id: string;
  createdAt: string; // ISO-8601 string: 2026-10-10T11:33:00.000Z
  updatedAt: string; // ISO-8601 string
  studyDate: string; // YYYY-MM-DD
  timeStr: string;   // 11:33 AM
  body: string;
  subject?: string;
  tags: string[];
  priority?: Priority;
  durationMinutes?: number;
  pinned?: boolean;
}

export interface JournalFilter {
  query?: string;
  tag?: string;
  subject?: string;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
}

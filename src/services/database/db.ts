import Dexie, { type EntityTable } from 'dexie';
import { JournalEntry } from '../../types/journal';
import { Deadline } from '../../types/deadline';
import { ReminderEvent } from '../../types/reminder';
import { AppSettings, DEFAULT_SETTINGS } from '../../types/settings';

export class StudyDockDatabase extends Dexie {
  journalEntries!: EntityTable<JournalEntry, 'id'>;
  deadlines!: EntityTable<Deadline, 'id'>;
  reminders!: EntityTable<ReminderEvent, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('StudyDockDB');

    this.version(1).stores({
      journalEntries: 'id, studyDate, createdAt, subject, *tags, priority, pinned',
      deadlines: 'id, dueAt, category, status, priority, subject, createdAt',
      reminders: 'id, deadlineId, scheduledAt, status, notificationId',
      settings: 'id',
    });

    this.on('populate', () => {
      this.settings.add(DEFAULT_SETTINGS);
    });
  }
}

export const db = new StudyDockDatabase();

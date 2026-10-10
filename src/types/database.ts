import { JournalEntry } from './journal';
import { Deadline } from './deadline';
import { ReminderEvent } from './reminder';
import { AppSettings } from './settings';

export interface StudyDockDatabaseSchema {
  journalEntries: JournalEntry;
  deadlines: Deadline;
  reminders: ReminderEvent;
  settings: AppSettings;
}

import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../src/services/database/db';
import { journalRepo } from '../src/services/database/journalRepo';
import { deadlineRepo } from '../src/services/database/deadlineRepo';
import { settingsRepo } from '../src/services/database/settingsRepo';

describe('Local Database & Persistence Layer', () => {
  beforeEach(async () => {
    await db.journalEntries.clear();
    await db.deadlines.clear();
    await db.reminders.clear();
    await db.settings.clear();
  });

  it('performs CRUD operations on journal repository', async () => {
    const added = await journalRepo.addEntry({
      studyDate: '2026-10-10',
      timeStr: '11:33 AM',
      body: 'Learned Dexie offline indexed storage',
      tags: ['cs', 'database'],
      priority: 'high',
      subject: 'CS',
    });

    expect(added.id).toBeDefined();
    expect(added.tags).toEqual(['cs', 'database']);

    const retrieved = await journalRepo.getEntryById(added.id);
    expect(retrieved?.body).toBe('Learned Dexie offline indexed storage');

    // Update
    await journalRepo.updateEntry(added.id, { body: 'Updated body text' });
    const updated = await journalRepo.getEntryById(added.id);
    expect(updated?.body).toBe('Updated body text');

    // Search
    const searchResults = await journalRepo.searchEntries({ query: 'database' });
    expect(searchResults.length).toBe(1);

    // Delete
    const deleted = await journalRepo.deleteEntry(added.id);
    expect(deleted).toBe(true);
    expect(await journalRepo.getEntryById(added.id)).toBeNull();
  });

  it('performs deadline state lifecycle without destructive auto-deletion', async () => {
    const deadline = await deadlineRepo.addDeadline({
      title: 'Physics Lab Report',
      subject: 'Physics',
      category: 'lab',
      dueAt: '2026-10-15T18:00:00.000',
      priority: 'high',
      notes: 'Include uncertainty calculations',
    });

    expect(deadline.status).toBe('active');

    // Complete
    const completed = await deadlineRepo.completeDeadline(deadline.id);
    expect(completed?.status).toBe('completed');
    expect(completed?.completedAt).toBeDefined();

    // Reopen
    const reopened = await deadlineRepo.reopenDeadline(deadline.id);
    expect(reopened?.status).toBe('active');

    // Archive
    const archived = await deadlineRepo.archiveDeadline(deadline.id);
    expect(archived?.status).toBe('archived');
  });

  it('persists and retrieves app settings', async () => {
    const defaultSettings = await settingsRepo.getSettings();
    expect(defaultSettings.userName).toBe('Student');
    expect(defaultSettings.notificationsEnabled).toBe(true);

    const updated = await settingsRepo.updateSettings({ userName: 'Alex', timeFormat: '24h' });
    expect(updated.userName).toBe('Alex');
    expect(updated.timeFormat).toBe('24h');

    const freshFetch = await settingsRepo.getSettings();
    expect(freshFetch.userName).toBe('Alex');
  });
});

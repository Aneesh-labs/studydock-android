import { db } from './db';
import { JournalEntry, JournalFilter } from '../../types/journal';

export const journalRepo = {
  async addEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<JournalEntry> {
    const now = new Date().toISOString();
    const id = entry.id || `jnl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const record: JournalEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
      tags: entry.tags.map(t => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean),
    };

    await db.journalEntries.put(record);
    return record;
  },

  async updateEntry(id: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>): Promise<JournalEntry | null> {
    const existing = await db.journalEntries.get(id);
    if (!existing) return null;

    const updated: JournalEntry = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      tags: updates.tags 
        ? updates.tags.map(t => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean)
        : existing.tags,
    };

    await db.journalEntries.put(updated);
    return updated;
  },

  async deleteEntry(id: string): Promise<boolean> {
    const existing = await db.journalEntries.get(id);
    if (!existing) return false;
    await db.journalEntries.delete(id);
    return true;
  },

  async getEntryById(id: string): Promise<JournalEntry | null> {
    return (await db.journalEntries.get(id)) || null;
  },

  async getEntriesByDate(studyDate: string): Promise<JournalEntry[]> {
    return await db.journalEntries
      .where('studyDate')
      .equals(studyDate)
      .sortBy('createdAt');
  },

  async getRecentEntries(_days: number = 7): Promise<Record<string, JournalEntry[]>> {
    const entries = await db.journalEntries.toArray();
    entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const result: Record<string, JournalEntry[]> = {};
    for (const entry of entries) {
      if (!result[entry.studyDate]) {
        result[entry.studyDate] = [];
      }
      result[entry.studyDate].push(entry);
    }

    return result;
  },

  async getAllEntries(): Promise<JournalEntry[]> {
    return await db.journalEntries.orderBy('studyDate').reverse().toArray();
  },

  async searchEntries(filter: JournalFilter): Promise<JournalEntry[]> {
    let collection = db.journalEntries.toCollection();

    let results = await collection.toArray();

    if (filter.query) {
      const q = filter.query.toLowerCase().trim();
      results = results.filter(e => 
        e.body.toLowerCase().includes(q) || 
        (e.subject && e.subject.toLowerCase().includes(q)) ||
        e.tags.some(t => t.includes(q))
      );
    }

    if (filter.tag) {
      const t = filter.tag.toLowerCase().trim().replace(/^#/, '');
      results = results.filter(e => e.tags.includes(t));
    }

    if (filter.subject) {
      const s = filter.subject.toLowerCase().trim();
      results = results.filter(e => e.subject && e.subject.toLowerCase() === s);
    }

    if (filter.priority) {
      results = results.filter(e => e.priority === filter.priority);
    }

    if (filter.startDate) {
      results = results.filter(e => e.studyDate >= filter.startDate!);
    }

    if (filter.endDate) {
      results = results.filter(e => e.studyDate <= filter.endDate!);
    }

    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async bulkImport(entries: JournalEntry[]): Promise<number> {
    await db.journalEntries.bulkPut(entries);
    return entries.length;
  },

  async clearAll(): Promise<void> {
    await db.journalEntries.clear();
  }
};

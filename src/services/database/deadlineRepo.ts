import { db } from './db';
import { Deadline, DeadlineCategory } from '../../types/deadline';
import { Priority } from '../../types/journal';

export const deadlineRepo = {
  async addDeadline(deadline: {
    title: string;
    subject?: string;
    category?: DeadlineCategory;
    dueAt: string;
    priority?: Priority;
    notes?: string;
    submissionUrl?: string;
    id?: string;
  }): Promise<Deadline> {
    const now = new Date().toISOString();
    const id = deadline.id || `dl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const record: Deadline = {
      id,
      title: deadline.title.trim(),
      subject: (deadline.subject || 'General').trim(),
      category: deadline.category || 'homework',
      dueAt: deadline.dueAt,
      priority: deadline.priority || 'medium',
      notes: deadline.notes ? deadline.notes.trim() : undefined,
      submissionUrl: deadline.submissionUrl ? deadline.submissionUrl.trim() : undefined,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await db.deadlines.put(record);
    return record;
  },

  async updateDeadline(id: string, updates: Partial<Omit<Deadline, 'id' | 'createdAt'>>): Promise<Deadline | null> {
    const existing = await db.deadlines.get(id);
    if (!existing) return null;

    const updated: Deadline = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.deadlines.put(updated);
    return updated;
  },

  async completeDeadline(id: string): Promise<Deadline | null> {
    return await this.updateDeadline(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  },

  async archiveDeadline(id: string): Promise<Deadline | null> {
    return await this.updateDeadline(id, {
      status: 'archived',
    });
  },

  async reopenDeadline(id: string): Promise<Deadline | null> {
    return await this.updateDeadline(id, {
      status: 'active',
      completedAt: undefined,
    });
  },

  async deleteDeadline(id: string): Promise<boolean> {
    const existing = await db.deadlines.get(id);
    if (!existing) return false;
    await db.deadlines.delete(id);
    // Also remove associated scheduled reminders
    await db.reminders.where('deadlineId').equals(id).delete();
    return true;
  },

  async getDeadlineById(id: string): Promise<Deadline | null> {
    return (await db.deadlines.get(id)) || null;
  },

  async getActiveDeadlines(): Promise<Deadline[]> {
    const items = await db.deadlines.where('status').equals('active').sortBy('dueAt');
    return items;
  },

  async getCompletedDeadlines(): Promise<Deadline[]> {
    const items = await db.deadlines.where('status').equals('completed').toArray();
    return items.sort((a, b) => (b.completedAt || b.updatedAt).localeCompare(a.completedAt || a.updatedAt));
  },

  async getArchivedDeadlines(): Promise<Deadline[]> {
    const items = await db.deadlines.where('status').equals('archived').toArray();
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getAllDeadlines(): Promise<Deadline[]> {
    return await db.deadlines.orderBy('dueAt').toArray();
  },

  async bulkImport(deadlines: Deadline[]): Promise<number> {
    await db.deadlines.bulkPut(deadlines);
    return deadlines.length;
  },

  async clearAll(): Promise<void> {
    await db.deadlines.clear();
    await db.reminders.clear();
  }
};

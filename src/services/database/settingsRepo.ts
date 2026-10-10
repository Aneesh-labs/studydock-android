import { db } from './db';
import { AppSettings, DEFAULT_SETTINGS } from '../../types/settings';

export const settingsRepo = {
  async getSettings(): Promise<AppSettings> {
    const existing = await db.settings.get('current');
    if (existing) return existing;
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  async updateSettings(updates: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      ...updates,
    };
    await db.settings.put(updated);
    return updated;
  },

  async resetSettings(): Promise<AppSettings> {
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
};

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from './components/layout/AppShell';
import { NavTab } from './components/layout/BottomNav';
import { HomeView } from './features/dashboard/HomeView';
import { JournalView } from './features/journal/JournalView';
import { DeadlinesView } from './features/deadlines/DeadlinesView';
import { InsightsView } from './features/insights/InsightsView';
import { SettingsModal } from './features/settings/SettingsModal';

import { JournalEntry, Priority } from './types/journal';
import { Deadline, DeadlineCategory } from './types/deadline';
import { AppSettings, DEFAULT_SETTINGS } from './types/settings';

import { journalRepo } from './services/database/journalRepo';
import { deadlineRepo } from './services/database/deadlineRepo';
import { settingsRepo } from './services/database/settingsRepo';
import { calculateStudyStats, formatLocalDate } from './services/engine/streakEngine';
import { notificationService } from './services/notifications/notificationService';
import { parseMarkdownFile } from './services/engine/markdownParser';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJournalAddOpen, setIsJournalAddOpen] = useState(false);
  const [isDeadlineAddOpen, setIsDeadlineAddOpen] = useState(false);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load Initial Data from Dexie DB
  const loadData = async () => {
    try {
      const [entriesData, deadlinesData, settingsData] = await Promise.all([
        journalRepo.getAllEntries(),
        deadlineRepo.getAllDeadlines(),
        settingsRepo.getSettings(),
      ]);
      setJournalEntries(entriesData);
      setDeadlines(deadlinesData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Active Deadlines Count
  const activeDeadlines = useMemo(() => {
    return deadlines.filter((d) => d.status === 'active');
  }, [deadlines]);

  // Compute Today's Journal Entries
  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const todayEntries = useMemo(() => {
    return journalEntries.filter((e) => e.studyDate === todayStr);
  }, [journalEntries, todayStr]);

  // Compute Stats
  const stats = useMemo(() => {
    return calculateStudyStats(journalEntries);
  }, [journalEntries]);

  // Add Journal Entry Handler
  const handleAddJournalEntry = async (entry: {
    body: string;
    tags: string[];
    priority?: Priority;
    subject?: string;
    studyDate?: string;
  }) => {
    const now = new Date();
    const targetDate = entry.studyDate || formatLocalDate(now);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEntry = await journalRepo.addEntry({
      body: entry.body,
      tags: entry.tags,
      priority: entry.priority,
      subject: entry.subject,
      studyDate: targetDate,
      timeStr,
    });

    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  // Delete Journal Entry Handler
  const handleDeleteJournalEntry = async (id: string) => {
    await journalRepo.deleteEntry(id);
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Add Deadline Handler
  const handleAddDeadline = async (data: {
    title: string;
    subject?: string;
    category?: DeadlineCategory;
    dueAt: string;
    priority?: Priority;
    notes?: string;
    submissionUrl?: string;
  }) => {
    const newDeadline = await deadlineRepo.addDeadline(data);
    setDeadlines((prev) => [...prev, newDeadline]);
    await notificationService.reconcileDeadlineReminders(newDeadline, settings);
  };

  // Complete Deadline Handler
  const handleCompleteDeadline = async (id: string) => {
    const updated = await deadlineRepo.completeDeadline(id);
    if (updated) {
      setDeadlines((prev) => prev.map((d) => (d.id === id ? updated : d)));
      await notificationService.cancelDeadlineReminders(id);
    }
  };

  // Reopen Deadline Handler
  const handleReopenDeadline = async (id: string) => {
    const updated = await deadlineRepo.reopenDeadline(id);
    if (updated) {
      setDeadlines((prev) => prev.map((d) => (d.id === id ? updated : d)));
      await notificationService.reconcileDeadlineReminders(updated, settings);
    }
  };

  // Delete Deadline Handler
  const handleDeleteDeadline = async (id: string) => {
    await deadlineRepo.deleteDeadline(id);
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
    await notificationService.cancelDeadlineReminders(id);
  };

  // Update Settings Handler
  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    const updated = await settingsRepo.updateSettings(updates);
    setSettings(updated);

    // Reconcile all active deadlines with updated settings
    for (const dl of activeDeadlines) {
      await notificationService.reconcileDeadlineReminders(dl, updated);
    }
  };

  // Export Data Handler
  const handleExportData = () => {
    const exportBundle = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      journalEntries,
      deadlines,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studydock_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Data Handler
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.md';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            // Legacy deadlines.json array
            const importedDeadlines: Deadline[] = parsed.map((item: any) => ({
              id: String(item.id || Math.random()),
              title: item.title || 'Untitled',
              subject: item.subject || 'General',
              category: item.category?.toLowerCase() || 'homework',
              dueAt: item.due?.includes('T') ? item.due : `${item.due?.replace(' ', 'T') || todayStr}:00.000`,
              priority: (item.priority?.toLowerCase() || 'medium') as Priority,
              notes: item.notes,
              status: item.completed ? 'completed' : 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
            await deadlineRepo.bulkImport(importedDeadlines);
          } else if (parsed.journalEntries || parsed.deadlines) {
            // Full StudyDock backup
            if (parsed.journalEntries) await journalRepo.bulkImport(parsed.journalEntries);
            if (parsed.deadlines) await deadlineRepo.bulkImport(parsed.deadlines);
          }
          await loadData();
          alert('Import completed successfully!');
        } catch (err) {
          alert('Failed to parse JSON file: ' + err);
        }
      } else if (file.name.endsWith('.md')) {
        try {
          const dateMatch = file.name.match(/\d{4}-\d{2}-\d{2}/);
          const dateStr = dateMatch ? dateMatch[0] : todayStr;
          const parsedEntries = parseMarkdownFile(text, dateStr);
          await journalRepo.bulkImport(parsedEntries);
          await loadData();
          alert(`Imported ${parsedEntries.length} entries from ${file.name}!`);
        } catch (err) {
          alert('Failed to parse Markdown file: ' + err);
        }
      }
    };
    input.click();
  };

  // Reset Data Handler
  const handleResetData = async () => {
    if (confirm('Are you sure you want to clear all notes and deadlines? This cannot be undone.')) {
      await journalRepo.clearAll();
      await deadlineRepo.clearAll();
      await loadData();
      setIsSettingsOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-slate-400">
        <div className="text-xs font-mono animate-pulse">Loading StudyDock...</div>
      </div>
    );
  }

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onOpenSettings={() => setIsSettingsOpen(true)}
      activeDeadlineCount={activeDeadlines.length}
    >
      {activeTab === 'home' && (
        <HomeView
          onQuickLogStudy={() => setIsJournalAddOpen(true)}
          onQuickAddDeadline={() => setIsDeadlineAddOpen(true)}
          onNavigateTab={setActiveTab}
          onCompleteDeadline={handleCompleteDeadline}
          upcomingDeadlines={activeDeadlines}
          todayEntries={todayEntries}
          stats={stats}
          userName={settings.userName}
        />
      )}

      {activeTab === 'journal' && (
        <JournalView
          entries={journalEntries}
          onAddEntry={handleAddJournalEntry}
          onDeleteEntry={handleDeleteJournalEntry}
          isQuickAddOpen={isJournalAddOpen}
          setIsQuickAddOpen={setIsJournalAddOpen}
        />
      )}

      {activeTab === 'deadlines' && (
        <DeadlinesView
          deadlines={deadlines}
          onAddDeadline={handleAddDeadline}
          onCompleteDeadline={handleCompleteDeadline}
          onReopenDeadline={handleReopenDeadline}
          onDeleteDeadline={handleDeleteDeadline}
          isQuickAddOpen={isDeadlineAddOpen}
          setIsQuickAddOpen={setIsDeadlineAddOpen}
        />
      )}

      {activeTab === 'insights' && (
        <InsightsView stats={stats} deadlines={deadlines} />
      )}

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </AppShell>
  );
};

export default App;

import React, { useState } from 'react';
import { Search, Plus, Trash2, Calendar, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { JournalEntry, Priority } from '../../types/journal';
import { formatHumanDate } from '../../lib/utils';

export interface JournalViewProps {
  entries: JournalEntry[];
  onAddEntry: (entry: { body: string; tags: string[]; priority?: Priority; subject?: string; studyDate?: string }) => void;
  onDeleteEntry: (id: string) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  isQuickAddOpen,
  setIsQuickAddOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Form State
  const [noteBody, setNoteBody] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [notePriority, setNotePriority] = useState<Priority>('medium');

  // Extract all unique tags
  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags))).sort();

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        e.body.toLowerCase().includes(q) ||
        (e.subject && e.subject.toLowerCase().includes(q)) ||
        e.tags.some((t) => t.includes(q));
      if (!match) return false;
    }
    if (selectedTag && !e.tags.includes(selectedTag)) return false;
    return true;
  });

  // Group by studyDate
  const groupedEntries: Record<string, JournalEntry[]> = {};
  for (const entry of filteredEntries) {
    if (!groupedEntries[entry.studyDate]) {
      groupedEntries[entry.studyDate] = [];
    }
    groupedEntries[entry.studyDate].push(entry);
  }

  const sortedDates = Object.keys(groupedEntries).sort().reverse();

  const handleSaveNote = () => {
    if (!noteBody.trim()) return;
    const parsedTags = noteTags
      .split(/[\s,]+/)
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    onAddEntry({
      body: noteBody.trim(),
      tags: parsedTags,
      subject: noteSubject.trim() || undefined,
      priority: notePriority,
    });

    setNoteBody('');
    setNoteTags('');
    setNoteSubject('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header & New Note Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Study Journal</h2>
          <p className="text-xs text-slate-400">Timestamped Markdown daily learning logs</p>
        </div>
        <Button
          onClick={() => setIsQuickAddOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3.5 py-2 rounded-xl shadow-glow-indigo gap-1.5"
        >
          <Plus className="w-4 h-4" /> Log Note
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, concepts, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-card text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
          />
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedTag === null
                  ? 'bg-indigo-500 text-white shadow-glow-indigo'
                  : 'glass-pill text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-indigo-500 text-white shadow-glow-indigo'
                    : 'glass-pill text-slate-400 hover:text-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries grouped by date */}
      {sortedDates.length === 0 ? (
        <Card className="text-center py-10 bg-slate-900/40 border-dashed border-slate-800">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-slate-300">No journal entries found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery || selectedTag
              ? 'Try clearing your search or tag filters.'
              : 'Start your study habit by logging what you studied today.'}
          </p>
          <Button
            size="sm"
            onClick={() => setIsQuickAddOpen(true)}
            className="mt-4 text-xs"
          >
            + Create First Note
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => {
            const dayEntries = groupedEntries[dateStr];
            return (
              <div key={dateStr} className="space-y-2.5">
                {/* Date Header */}
                <div className="flex items-center gap-2 px-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300">
                    {formatHumanDate(dateStr)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    ({dayEntries.length} {dayEntries.length === 1 ? 'note' : 'notes'})
                  </span>
                  <div className="flex-1 h-px bg-slate-800 ml-2" />
                </div>

                {/* Day Notes List */}
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <Card key={entry.id} className="p-3.5 group hover:border-slate-700 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-mono font-semibold text-indigo-300">
                              [{entry.timeStr}]
                            </span>
                            {entry.subject && (
                              <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                                {entry.subject}
                              </span>
                            )}
                            {entry.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[11px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md"
                              >
                                #{t}
                              </span>
                            ))}
                            {entry.priority && (
                              <Badge priority={entry.priority} className="text-[10px] py-0 px-1.5">
                                {entry.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                            {entry.body}
                          </p>
                        </div>

                        {/* Delete Action */}
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Note Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Log Study Note"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              What did you study / accomplish? *
            </label>
            <textarea
              autoFocus
              rows={3}
              placeholder="e.g. Completed 50 Class 9 Biology questions on Cell Division"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Biology, CS"
                value={noteSubject}
                onChange={(e) => setNoteSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags (space or comma)
              </label>
              <input
                type="text"
                placeholder="e.g. biology cell-division"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNotePriority(p)}
                  className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                    notePriority === p
                      ? p === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : p === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsQuickAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-500"
              onClick={handleSaveNote}
              disabled={!noteBody.trim()}
            >
              Save Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

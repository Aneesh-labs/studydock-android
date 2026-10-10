import React, { useState } from 'react';
import { Plus, CheckCircle2, RotateCcw, Trash2, Clock, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Deadline, DeadlineCategory } from '../../types/deadline';
import { Priority } from '../../types/journal';
import { calculateCountdown } from '../../services/engine/deadlineEngine';

export interface DeadlinesViewProps {
  deadlines: Deadline[];
  onAddDeadline: (deadline: {
    title: string;
    subject?: string;
    category?: DeadlineCategory;
    dueAt: string;
    priority?: Priority;
    notes?: string;
    submissionUrl?: string;
  }) => void;
  onCompleteDeadline: (id: string) => void;
  onReopenDeadline: (id: string) => void;
  onDeleteDeadline: (id: string) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  deadlines,
  onAddDeadline,
  onCompleteDeadline,
  onReopenDeadline,
  onDeleteDeadline,
  isQuickAddOpen,
  setIsQuickAddOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'overdue' | 'completed'>('active');

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [category, setCategory] = useState<DeadlineCategory>('homework');
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  // Default to tomorrow's date
  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const now = new Date();

  // Categorize deadlines
  const activeItems: Deadline[] = [];
  const overdueItems: Deadline[] = [];
  const completedItems: Deadline[] = [];

  for (const dl of deadlines) {
    if (dl.status === 'completed') {
      completedItems.push(dl);
    } else {
      const dueDt = new Date(dl.dueAt);
      if (dueDt.getTime() < now.getTime()) {
        overdueItems.push(dl);
      } else {
        activeItems.push(dl);
      }
    }
  }

  const currentList =
    activeTab === 'active'
      ? activeItems
      : activeTab === 'overdue'
      ? overdueItems
      : completedItems;

  const handleOpenAddModal = () => {
    if (!dueDate) {
      setDueDate(getTomorrowDateStr());
    }
    setIsQuickAddOpen(true);
  };

  const handleSaveDeadline = () => {
    if (!title.trim() || !dueDate) return;

    const fullDueAt = `${dueDate}T${dueTime || '23:59'}:00.000`;

    onAddDeadline({
      title: title.trim(),
      subject: subject.trim() || 'General',
      category,
      dueAt: fullDueAt,
      priority,
      notes: notes.trim() || undefined,
      submissionUrl: submissionUrl.trim() || undefined,
    });

    setTitle('');
    setSubject('');
    setNotes('');
    setSubmissionUrl('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Deadlines & Exams</h2>
          <p className="text-xs text-slate-400">Scheduled milestone alerts & countdowns</p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3.5 py-2 rounded-xl shadow-glow-indigo gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {/* Sub-Tabs: Active, Overdue, Completed */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-indigo-600 text-white shadow-glow-indigo'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Active</span>
          {activeItems.length > 0 && (
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {activeItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Overdue</span>
          {overdueItems.length > 0 && (
            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
              {overdueItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Done</span>
          {completedItems.length > 0 && (
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {completedItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Deadline List */}
      {currentList.length === 0 ? (
        <Card className="text-center py-10 bg-slate-900/40 border-dashed border-slate-800">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
          <p className="text-sm font-semibold text-slate-300">
            {activeTab === 'active'
              ? 'No active deadlines'
              : activeTab === 'overdue'
              ? 'No overdue deadlines!'
              : 'No completed deadlines yet'}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeTab === 'active'
              ? 'Stay ahead by adding assignments, homework, and exams.'
              : activeTab === 'overdue'
              ? 'Great job keeping up with your schedule!'
              : 'Tasks you complete will be preserved here for your records.'}
          </p>
          {activeTab === 'active' && (
            <Button size="sm" onClick={handleOpenAddModal} className="mt-4 text-xs">
              + Add First Deadline
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {currentList.map((dl) => {
            const countdown = calculateCountdown(dl.dueAt);
            const dueObj = new Date(dl.dueAt);
            const formattedDue = dueObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Card key={dl.id} className="p-4 group hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge category={dl.category}>{dl.category}</Badge>
                      <Badge priority={dl.priority}>{dl.priority}</Badge>
                      <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md truncate">
                        {dl.subject}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 break-words">{dl.title}</h4>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {formattedDue}
                      </span>
                    </div>

                    {dl.notes && (
                      <p className="text-xs text-slate-300/90 pt-1 leading-relaxed">{dl.notes}</p>
                    )}

                    {dl.submissionUrl && (
                      <a
                        href={dl.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline pt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" /> Submission Link
                      </a>
                    )}
                  </div>

                  {/* Actions & Urgency */}
                  <div className="flex flex-col items-end gap-2.5">
                    {dl.status === 'active' ? (
                      <Badge urgency={countdown.urgency}>{countdown.label}</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        Completed
                      </Badge>
                    )}

                    <div className="flex items-center gap-1">
                      {dl.status === 'completed' ? (
                        <button
                          onClick={() => onReopenDeadline(dl.id)}
                          className="text-slate-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          title="Reopen deadline"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onCompleteDeadline(dl.id)}
                          className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                          title="Mark Complete"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteDeadline(dl.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Delete deadline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Deadline Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Add Deadline / Exam"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Title / Assignment *
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Calculus Problem Set 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Math, Physics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DeadlineCategory)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="homework">Homework</option>
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="quiz">Quiz</option>
                <option value="lab">Lab</option>
                <option value="project">Project</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Due Time (Default: 11:59 PM)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                    priority === p
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes / Textbook Chapters (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bring calculator, review chapters 4-6"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
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
              onClick={handleSaveDeadline}
              disabled={!title.trim() || !dueDate}
            >
              Save Deadline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

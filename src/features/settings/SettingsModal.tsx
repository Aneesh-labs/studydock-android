import React, { useState } from 'react';
import { Bell, Download, Upload, ShieldCheck, Trash2, Smartphone, Check } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { AppSettings } from '../../types/settings';
import { ReminderMilestone } from '../../types/reminder';
import { notificationService } from '../../services/notifications/notificationService';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [testSuccess, setTestSuccess] = useState(false);

  const handleTestNotification = async () => {
    const success = await notificationService.sendTestNotification();
    if (success) {
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    }
  };

  const toggleMilestone = (m: ReminderMilestone) => {
    const current = new Set(settings.enabledMilestones);
    if (current.has(m)) {
      current.delete(m);
    } else {
      current.add(m);
    }
    onUpdateSettings({ enabledMilestones: Array.from(current) });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preferences & Data">
      <div className="space-y-5 text-xs text-slate-300">
        {/* Notifications Section */}
        <div className="space-y-2.5 pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="font-bold text-slate-100">Android Notifications</div>
                <div className="text-[11px] text-slate-400">Scheduled milestone deadline alerts</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.notificationsEnabled && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-semibold text-slate-400">Alert Milestones</div>
              <div className="grid grid-cols-2 gap-2">
                {(['48h', '24h', '2h', 'due'] as ReminderMilestone[]).map((m) => {
                  const isEnabled = settings.enabledMilestones.includes(m);
                  const labels: Record<ReminderMilestone, string> = {
                    '48h': '48h before',
                    '24h': '24h before',
                    '2h': '2h before',
                    due: 'At Due Time',
                  };
                  return (
                    <button
                      key={m}
                      onClick={() => toggleMilestone(m)}
                      className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                        isEnabled
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{labels[m]}</span>
                      {isEnabled && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="glass"
                size="sm"
                onClick={handleTestNotification}
                className="w-full mt-2 text-xs gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                {testSuccess ? 'Notification Sent!' : 'Send Test Notification'}
              </Button>
            </div>
          )}
        </div>

        {/* Data & Backup Section */}
        <div className="space-y-2.5 pb-4 border-b border-slate-800">
          <div className="font-bold text-slate-100 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-400" />
            Data Backup & Interoperability
          </div>
          <p className="text-[11px] text-slate-400">
            Export notes as Markdown files and deadlines as JSON matching the original desktop format.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={onExportData} className="text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export Data
            </Button>
            <Button variant="secondary" size="sm" onClick={onImportData} className="text-xs gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Import Data
            </Button>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="space-y-1.5 pb-4 border-b border-slate-800">
          <div className="font-bold text-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Privacy & Offline Policy
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            StudyDock is 100% offline-first. Your notes, study habits, and deadlines are stored exclusively on this device. No account, no cloud servers, no trackers.
          </p>
        </div>

        {/* App Version & Reset */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[10px] text-slate-500 font-mono">
            StudyDock v1.0.0 (Offline Native)
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={onResetData}
            className="text-[11px] gap-1 px-2.5 py-1 min-h-[32px]"
          >
            <Trash2 className="w-3 h-3" /> Clear Data
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React from 'react';
import { Settings } from 'lucide-react';
import { BottomNav, NavTab } from './BottomNav';
import { Button } from '../ui/Button';

export interface AppShellProps {
  children: React.ReactNode;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  activeDeadlineCount?: number;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onSelectTab,
  onOpenSettings,
  activeDeadlineCount = 0,
}) => {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-[#090d16] text-slate-100 relative selection:bg-indigo-500/30">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 pt-[calc(var(--sat)+0.75rem)] pb-3 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-glow-indigo text-white font-black text-sm tracking-wider">
            SD
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight">StudyDock</h1>
            <p className="text-[10px] font-medium text-indigo-400/90 tracking-wide uppercase">Offline Study & Sentinel</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="rounded-full text-slate-400 hover:text-white"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Main View Area */}
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        activeDeadlineCount={activeDeadlineCount}
      />
    </div>
  );
};

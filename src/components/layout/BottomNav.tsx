import React from 'react';
import { Home, BookOpen, Clock, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type NavTab = 'home' | 'journal' | 'deadlines' | 'insights';

export interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeDeadlineCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  activeDeadlineCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'journal' as NavTab, label: 'Journal', icon: BookOpen },
    { id: 'deadlines' as NavTab, label: 'Deadlines', icon: Clock, badge: activeDeadlineCount },
    { id: 'insights' as NavTab, label: 'Insights', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 pb-[calc(var(--sab)+0.5rem)] pt-2 px-4 backdrop-blur-xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95',
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-200',
                    isActive && 'scale-110 stroke-[2.5px]'
                  )}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center border-2 border-[#090d16]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-8 h-1 bg-indigo-500 rounded-full shadow-glow-indigo" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

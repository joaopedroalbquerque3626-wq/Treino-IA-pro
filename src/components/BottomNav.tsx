import React from 'react';
import { LayoutDashboard, Dumbbell, Calendar, TrendingUp, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'workouts', label: 'Treinos', icon: Dumbbell },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-1 py-1.5 pb-safe shadow-lg transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[46px] select-none ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-600/15'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 scale-110'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

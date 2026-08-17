import React from 'react';
import { Dumbbell, Flame, Bell, Sun, Moon } from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';

interface NavbarProps {
  profile: UserProfile | null;
  activeTab: string;
  onNavigate: (tab: string) => void;
  streakDays: number;
  onOpenNotifications: () => void;
  onOpenSafety?: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onLoginDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  onNavigate,
  streakDays,
  onOpenNotifications,
  themeMode,
  onToggleTheme,
  onLoginDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate(profile ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform shrink-0">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white truncate">
                TREINO IA PRO
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-500/30 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-semibold tracking-wider hidden md:block">
              Seu objetivo. Sua evolução.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            title={themeMode === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>

          {profile ? (
            <>
              {/* Streak Badge */}
              <div
                title="Sequência de dias com treino concluído"
                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 sm:px-2.5 py-1 rounded-xl text-blue-600 dark:text-blue-400 font-bold text-xs"
              >
                <Flame className="w-3.5 h-3.5 fill-blue-500/30 text-blue-600 dark:text-blue-400 animate-pulse shrink-0" />
                <span className="text-[11px] sm:text-xs">{streakDays}d</span>
              </div>

              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                title="Notificações"
                aria-label="Notificações"
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
              </button>

              {/* Profile Avatar button */}
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/40 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate hidden sm:inline">{profile.name}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onLoginDemo}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                ENTRAR
              </button>
              <button
                onClick={() => onNavigate('questionnaire')}
                className="px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                CRIAR PLANO
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

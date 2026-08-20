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
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const effectiveThemeLabel = themeMode === 'system' ? 'Tema automático' : themeMode === 'dark' ? 'Modo escuro' : 'Modo claro';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs transition-colors duration-200 pt-safe">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onNavigate(profile ? 'dashboard' : 'landing')}
          aria-label={profile ? 'Ir para o painel inicial' : 'Ir para a página inicial'}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0 text-left rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform shrink-0">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white truncate">
                TREINO IA PRO
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/30 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-semibold tracking-wider hidden md:block">
              Seu objetivo. Sua evolução.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            title={`${effectiveThemeLabel}. Alternar entre claro e escuro.`}
            aria-label={`${effectiveThemeLabel}. Alternar tema.`}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" aria-hidden="true" />
            )}
          </button>

          {profile ? (
            <>
              <div
                title="Sequência de dias com treino concluído"
                aria-label={`Sequência de ${streakDays} dias`}
                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 sm:px-2.5 py-1 rounded-xl text-blue-600 dark:text-blue-400 font-bold text-xs min-h-[36px]"
              >
                <Flame className="w-3.5 h-3.5 fill-blue-500/30 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                <span className="text-[11px] sm:text-xs">{streakDays}d</span>
              </div>

              <button
                type="button"
                onClick={onOpenNotifications}
                title="Notificações"
                aria-label="Abrir notificações"
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('profile')}
                aria-current={activeTab === 'profile' ? 'page' : undefined}
                aria-label={`Abrir perfil de ${profile.name}`}
                className={`flex items-center gap-1.5 min-h-[44px] p-1 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/40 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]" aria-hidden="true">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[80px] truncate hidden sm:inline">{profile.name || 'Perfil'}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onLoginDemo}
                className="min-h-[44px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer rounded-xl"
              >
                VER DEMO
              </button>
              <button
                type="button"
                onClick={() => onNavigate('questionnaire')}
                className="min-h-[44px] px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
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

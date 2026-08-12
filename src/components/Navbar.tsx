import React from 'react';
import { Dumbbell, Flame, Bell, User, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  profile: UserProfile | null;
  activeTab: string;
  onNavigate: (tab: string) => void;
  streakDays: number;
  onOpenNotifications: () => void;
  onOpenSafety: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  onNavigate,
  streakDays,
  onOpenNotifications,
  onOpenSafety,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate(profile ? 'dashboard' : 'landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                TREINO IA PRO
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider hidden sm:block">
              Seu objetivo. Sua evolução.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        {profile ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Badge */}
            <div
              title="Sequência de dias com treino concluído"
              className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 font-semibold text-xs"
            >
              <Flame className="w-4 h-4 fill-blue-500/30 text-blue-400 animate-pulse" />
              <span>{streakDays} {streakDays === 1 ? 'dia' : 'dias'}</span>
            </div>

            {/* Safety Disclaimer Info button */}
            <button
              onClick={onOpenSafety}
              title="Aviso de Segurança & Saúde"
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              title="Notificações"
              className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400" />
            </button>

            {/* Profile Avatar button */}
            <button
              onClick={() => onNavigate('profile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 font-bold shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[90px] truncate hidden md:inline">{profile.name}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              ENTRAR
            </button>
            <button
              onClick={() => onNavigate('questionnaire')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
            >
              COMEÇAR AGORA
            </button>
          </div>
        )}
      </div>
    </header>
  );
};


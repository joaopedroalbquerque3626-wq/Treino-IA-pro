import React from 'react';
import { Bell, Flame, Sparkles, TrendingUp, X } from 'lucide-react';
import { UserProfile } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  streakDays: number;
  onNavigate: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  profile,
  streakDays,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: '1',
      title: 'Plano do Dia Disponível',
      desc: 'Seu treino programado está pronto para ser iniciado no Painel Principal.',
      time: 'Hoje, 08:00',
      icon: Sparkles,
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800',
      actionTab: 'dashboard',
    },
    {
      id: '2',
      title: `Sequência Ativa: ${streakDays} ${streakDays === 1 ? 'dia' : 'dias'}!`,
      desc: 'Mantenha a consistência para otimizar seus resultados de hipertrofia e força.',
      time: 'Hoje',
      icon: Flame,
      iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800',
      actionTab: 'evolution',
    },
    {
      id: '3',
      title: 'Dica do Assistente IA',
      desc: 'Lembre-se de registrar a carga exata executada para calibrar o aumento progressivo.',
      time: 'Ontem',
      icon: TrendingUp,
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800',
      actionTab: 'chat',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-900 dark:text-white shadow-2xl relative animate-in zoom-in-95 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notificações e Avisos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Acompanhamento inteligente da sua rotina</p>
          </div>
        </div>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                onClick={() => {
                  onNavigate(notif.actionTab);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${notif.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    {notif.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

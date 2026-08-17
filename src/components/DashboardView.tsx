import React from 'react';
import { Play, Dumbbell, Calendar, Flame, TrendingUp, Clock, Target, Sparkles, ChevronRight, CheckCircle2, MessageSquare, Award } from 'lucide-react';
import { UserProfile, WorkoutPlan, CompletedSession } from '../types';

interface DashboardViewProps {
  profile: UserProfile;
  workoutPlan: WorkoutPlan | null;
  history: CompletedSession[];
  streakDays: number;
  onStartWorkout: (dayId: string) => void;
  onNavigate: (tab: string) => void;
  onRegeneratePlan: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  workoutPlan,
  history,
  streakDays,
  onStartWorkout,
  onNavigate,
  onRegeneratePlan,
}) => {
  // Determine Today's Workout
  const activeWorkoutDays = workoutPlan?.days.filter((d) => !d.isRestDay) || [];
  const completedThisWeek = history.filter((s) => {
    const diffDays = (Date.now() - new Date(s.date).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  const todayWorkoutDay = activeWorkoutDays.length > 0
    ? activeWorkoutDays[completedThisWeek.length % activeWorkoutDays.length]
    : null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-8 animate-in fade-in pb-28">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700 inline-block">
            PAINEL PRINCIPAL
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 sm:mt-2">
            Olá, {profile.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Seu progresso diário e treinos personalizados por IA.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
          <div className="bg-white dark:bg-slate-900 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Objetivo</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{profile.objective}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Frequência</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{profile.daysPerWeek}x / semana</p>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column - Hero Workout & Evolution */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* TODAY'S WORKOUT HERO CARD */}
          {todayWorkoutDay ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 p-5 sm:p-7 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 text-slate-900 dark:text-white pointer-events-none">
                <Dumbbell className="w-28 sm:w-36 h-28 sm:h-36" />
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[10px] sm:text-xs uppercase font-extrabold text-blue-600 dark:text-blue-400 tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-700">
                  Treino de Hoje
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {todayWorkoutDay.estimatedDuration}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {todayWorkoutDay.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {todayWorkoutDay.exercises.length} exercícios planejados • Foco: {todayWorkoutDay.targetGoal}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-[11px] font-semibold">
                      📍 {profile.location}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[11px] font-semibold">
                      ⚡ {profile.experience}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onStartWorkout(todayWorkoutDay.id)}
                  className="w-full md:w-auto min-h-[48px] px-6 sm:px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>COMEÇAR TREINO</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 text-center space-y-3 transition-colors">
              <Dumbbell className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Nenhum plano de treino ativo</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gere um plano personalizado para começar seu ciclo de treinos.</p>
              <button
                onClick={onRegeneratePlan}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 cursor-pointer"
              >
                GERAR PLANO AGORA
              </button>
            </div>
          )}

          {/* Weekly Chart & AI Suggestion Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Weekly Bar Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors">
              <h3 className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">
                Frequência Semanal
              </h3>
              <div className="h-28 sm:h-32 flex items-end justify-between gap-1.5 mt-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, idx) => {
                  const isDone = completedThisWeek.some((s) => new Date(s.date).getDay() === idx);
                  const isToday = new Date().getDay() === idx;
                  const barHeight = isDone ? 'h-[90%]' : isToday ? 'h-[35%]' : 'h-[12%]';
                  
                  return (
                    <div key={dayName} className="w-full flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isDone
                            ? 'bg-blue-600'
                            : isToday
                            ? 'bg-blue-300 dark:bg-blue-500/50'
                            : 'bg-slate-100 dark:bg-slate-800'
                        } ${barHeight}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[9px] sm:text-[10px] text-slate-400 font-bold">
                <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SAB</span>
              </div>
            </div>

            {/* Training Focus & Guidelines Box */}
            <div className="bg-slate-900 dark:bg-slate-900 rounded-3xl p-5 text-white border border-slate-800 flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-start">
                <h3 className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  <span>Diretriz do Plano</span>
                </h3>
                <span className="flex h-2 w-2 rounded-full bg-blue-500" />
              </div>
              <p className="text-xs italic text-slate-300 my-3 leading-relaxed">
                "{workoutPlan?.aiAnalysisNotes || `Plano estruturado para ${profile.objective} com foco em consistência e progressão de cargas.`}"
              </p>
              <button
                onClick={() => onNavigate('workouts')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold border border-slate-700 text-blue-400 flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>VER PLANO COMPLETO</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity & Goal Progress */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Goal & Streak Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-blue-600/20">
            <h2 className="text-[10px] sm:text-xs uppercase font-bold text-white/70 tracking-widest mb-3">
              Consistência & Frequência
            </h2>
            <div className="flex items-end justify-between">
              <span className="text-2xl sm:text-3xl font-black italic">
                {streakDays}<span className="text-base font-normal ml-1 opacity-80">{streakDays === 1 ? 'dia' : 'dias'}</span>
              </span>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                Sequência Ativa 🔥
              </span>
            </div>
            
            <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (completedThisWeek.length / profile.daysPerWeek) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] mt-2.5 font-medium text-white/90">
              {completedThisWeek.length} de {profile.daysPerWeek} treinos concluídos nesta semana.
            </p>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
            <h2 className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-widest mb-4">
              Atividade Recente
            </h2>
            
            {history.length > 0 ? (
              <div className="space-y-3.5">
                {history.slice(-3).reverse().map((session, idx) => (
                  <div key={session.id || idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{session.workoutTitle}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{session.date} • {session.durationMinutes} min</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">+100%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 text-xs">
                Nenhum treino registrado ainda nesta semana.
              </div>
            )}

            <button
              onClick={() => onNavigate('history')}
              className="w-full mt-4 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors cursor-pointer active:scale-95"
            >
              VER HISTÓRICO COMPLETO
            </button>
          </div>
        </div>
      </section>

      {/* Footer info */}
      <footer className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold transition-colors">
        <div className="flex flex-wrap items-center justify-center gap-4 text-center">
          <span>© 2026 TREINO IA PRO</span>
          <span className="text-amber-500/90">Consulte um profissional de saúde</span>
        </div>
      </footer>
    </div>
  );
};

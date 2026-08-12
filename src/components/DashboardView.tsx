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

  const nextWorkoutDay = activeWorkoutDays.length > 1
    ? activeWorkoutDays[(completedThisWeek.length + 1) % activeWorkoutDays.length]
    : null;

  const lastSession = history[history.length - 1];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in pb-24">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            PAINEL PRINCIPAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Olá, {profile.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Seu progresso diário e treinos personalizados orientados por IA.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 min-w-[120px]">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Objetivo Atual</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{profile.objective}</p>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 min-w-[110px]">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Frequência</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-800">{profile.daysPerWeek}x por Semana</p>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Hero Workout & Evolution */}
        <div className="lg:col-span-8 space-y-6">
          {/* TODAY'S WORKOUT HERO CARD */}
          {todayWorkoutDay ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
                <Dumbbell className="w-36 h-36" />
              </div>
              
              <h2 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-4">
                Treino de Hoje
              </h2>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                    {todayWorkoutDay.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {todayWorkoutDay.exercises.length} exercícios • {todayWorkoutDay.estimatedDuration} • Foco: {todayWorkoutDay.targetGoal}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase">
                      {profile.location}
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold uppercase">
                      {profile.experienceLevel}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onStartWorkout(todayWorkoutDay.id)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>COMEÇAR TREINO</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center space-y-3">
              <Dumbbell className="w-10 h-10 text-blue-600 mx-auto" />
              <h2 className="text-base font-bold text-slate-900">Nenhum plano de treino ativo</h2>
              <p className="text-xs text-slate-500">Gere um plano personalizado para começar seu ciclo de treinos.</p>
              <button
                onClick={onRegeneratePlan}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
              >
                GERAR PLANO AGORA
              </button>
            </div>
          )}

          {/* Weekly Chart & AI Suggestion Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-3">
                Evolução Semanal
              </h3>
              <div className="h-32 flex items-end justify-between gap-1.5 mt-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, idx) => {
                  const isDone = completedThisWeek.some((s) => new Date(s.date).getDay() === idx);
                  const isToday = new Date().getDay() === idx;
                  const barHeight = isDone ? 'h-[90%]' : isToday ? 'h-[35%]' : 'h-[10%]';
                  
                  return (
                    <div key={dayName} className="w-full flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className={`w-full rounded-t-sm transition-all ${
                          isDone
                            ? 'bg-blue-600'
                            : isToday
                            ? 'bg-blue-200'
                            : 'bg-slate-100'
                        } ${barHeight}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold">
                <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SAB</span>
              </div>
            </div>

            {/* AI Assistant Insight Box */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Assistente IA</span>
                </h3>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm italic text-slate-300 my-4 leading-relaxed">
                "{workoutPlan?.aiAnalysisNotes || `Plano configurado para ${profile.objective} com foco em progressão constante de carga.`}"
              </p>
              <button
                onClick={() => onNavigate('chat')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold border border-slate-700 text-blue-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>CONVERSAR COM IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity & Goal Progress */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-6">
              Atividade Recente
            </h2>
            
            {history.length > 0 ? (
              <div className="space-y-5">
                {history.slice(-3).reverse().map((session, idx) => (
                  <div key={session.id || idx} className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{session.workoutTitle}</p>
                      <p className="text-[10px] text-slate-500">{session.date} • {session.durationMinutes} minutos</p>
                    </div>
                    <span className="text-xs font-bold text-green-600 shrink-0">+100%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhum treino registrado ainda nesta semana.
              </div>
            )}

            <button
              onClick={() => onNavigate('history')}
              className="w-full mt-6 py-3 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
            >
              VER HISTÓRICO COMPLETO
            </button>
          </div>

          {/* Goal & Streak Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20">
            <h2 className="text-xs uppercase font-bold text-white/60 tracking-widest mb-4">
              Consistência & Frequência
            </h2>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black italic">
                {streakDays}<span className="text-lg font-normal ml-1 opacity-80">{streakDays === 1 ? 'dia' : 'dias'}</span>
              </span>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded">
                Sequência Ativa 🔥
              </span>
            </div>
            
            <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (completedThisWeek.length / profile.daysPerWeek) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] mt-3 font-medium text-white/80">
              {completedThisWeek.length} de {profile.daysPerWeek} treinos concluídos nos últimos 7 dias.
            </p>
          </div>
        </div>
      </section>

      {/* Footer info in Professional Polish theme */}
      <footer className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        <div className="flex flex-wrap items-center gap-6">
          <span>© 2026 TREINO IA PRO</span>
          <span className="text-red-500/80">Atenção: Consulte um profissional de saúde</span>
        </div>
        <div className="flex gap-4">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Privacidade</a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">Suporte</a>
        </div>
      </footer>
    </div>
  );
};


import React, { useState } from 'react';
import { Dumbbell, Clock, Flame, Sparkles, RefreshCw, Play } from 'lucide-react';
import { WorkoutPlan, Exercise, UserProfile } from '../types';

interface WorkoutPlanViewProps {
  plan: WorkoutPlan;
  profile: UserProfile;
  onStartWorkout: (dayId: string) => void;
  onOpenSubstituteModal: (exercise: Exercise) => void;
  onCustomPlanPrompt: (promptText: string) => void;
  loadingRegen?: boolean;
}

export const WorkoutPlanView: React.FC<WorkoutPlanViewProps> = ({
  plan,
  profile,
  onStartWorkout,
  onOpenSubstituteModal,
  onCustomPlanPrompt,
  loadingRegen = false,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>(
    plan.days.find((d) => !d.isRestDay)?.id || plan.days[0]?.id || ''
  );

  const [tweakPrompt, setTweakPrompt] = useState('');

  const selectedDay = plan.days.find((d) => d.id === selectedDayId) || plan.days[0];

  const handleSendTweak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweakPrompt.trim()) return;
    onCustomPlanPrompt(tweakPrompt);
    setTweakPrompt('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-in fade-in pb-28">
      {/* "SEU PLANO ESTÁ PRONTO" Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>SEU PLANO ESTÁ PRONTO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Rotina Personalizada por IA
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {plan.aiAnalysisNotes || 'Seu plano foi estruturado considerando seu objetivo, frequência e equipamentos disponíveis.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700">
              📅 {plan.summary.daysPerWeek} dias/semana
            </span>
          </div>
        </div>

        {/* Profile Summary Card */}
        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] block font-bold">OBJETIVO</span>
            <span className="font-extrabold text-white truncate block">{plan.summary.objective}</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] block font-bold">NÍVEL</span>
            <span className="font-extrabold text-blue-400 truncate block">{plan.summary.experience}</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] block font-bold">FREQUÊNCIA</span>
            <span className="font-extrabold text-white truncate block">{plan.summary.daysPerWeek}x / semana</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] block font-bold">TEMPO/SESSÃO</span>
            <span className="font-extrabold text-blue-400 truncate block">{plan.summary.sessionTimeMin} min</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] block font-bold">LOCAL</span>
            <span className="font-extrabold text-white truncate block">{plan.summary.location}</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 text-[10px] block font-bold">EQUIPAMENTOS</span>
            <span className="font-extrabold text-slate-200 truncate block">
              {plan.summary.equipment?.length || 0} cadastrados
            </span>
          </div>
        </div>
      </div>

      {/* WEEKLY SPLIT DAY SELECTOR TABS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Divisão Semanal</span>
        </h3>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {plan.days.map((day) => {
            const isSelected = day.id === selectedDayId;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 font-extrabold'
                    : day.isRestDay
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {day.isRestDay ? '😴' : '🏋️'}
                  <span>{day.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED WORKOUT DAY DETAILS */}
      {selectedDay && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-xs transition-colors">
          {/* Day Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  {selectedDay.isRestDay ? 'Dia de Descanso' : `Dia ${selectedDay.dayNumber}`}
                </span>
                {!selectedDay.isRestDay && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    ⏱️ Duração estimada: {selectedDay.estimatedDuration}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                🏋️ {selectedDay.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                🎯 Objetivo do treino: {selectedDay.targetGoal}
              </p>
            </div>

            {!selectedDay.isRestDay && (
              <button
                onClick={() => onStartWorkout(selectedDay.id)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>INICIAR MODO TREINO</span>
              </button>
            )}
          </div>

          {selectedDay.isRestDay ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-4xl">😴</p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Dia de Descanso e Regeneração</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                O descanso é fundamental para a síntese proteica e reconstrução muscular. Aproveite para hidratar-se e manter boa alimentação.
              </p>
            </div>
          ) : (
            <>
              {/* Warmup Section */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-start gap-3">
                <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900 dark:text-amber-300 mb-0.5">🔥 Aquecimento Recomendado:</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedDay.warmup}</p>
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Lista de Exercícios ({selectedDay.exercises.length})
                </h3>

                <div className="space-y-3">
                  {selectedDay.exercises.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 mr-2">
                            {idx + 1}. {ex.muscleGroup}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white inline-block mt-1 sm:mt-0">
                            {ex.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenSubstituteModal(ex)}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-600 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Substituir</span>
                          </button>
                        </div>
                      </div>

                      {/* Details Badge row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                          <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-bold">Séries</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{ex.sets} séries</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                          <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-bold">Repetições</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">{ex.reps}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                          <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-bold">Descanso</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">{ex.restSeconds}s</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center truncate">
                          <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-bold">Equipamento</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">{ex.equipment}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                        💡 <strong>Orientação:</strong> {ex.executionTip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CUSTOM PLAN TWEAK / IA REGENERATION SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Solicitar Alterações ao Plano com IA</h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Precisa mudar o número de dias, tempo disponível ou retirar algum exercício? Digite seu pedido abaixo:
        </p>

        <form onSubmit={handleSendTweak} className="flex gap-2">
          <input
            type="text"
            placeholder='Ex: "Quero treinar 4 dias", "Tenho apenas 45 minutos", "Não quero agachamento"...'
            value={tweakPrompt}
            onChange={(e) => setTweakPrompt(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loadingRegen}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            {loadingRegen ? 'Atualizando...' : 'Atualizar Plano'}
          </button>
        </form>
      </div>
    </div>
  );
};

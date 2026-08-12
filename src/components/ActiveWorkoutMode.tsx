import React, { useState } from 'react';
import { Play, CheckCircle2, ChevronRight, Timer, ArrowLeft, Trophy, RefreshCw } from 'lucide-react';
import { WorkoutDay, Exercise, UserProfile, CompletedSession, ExerciseSetLog } from '../types';

interface ActiveWorkoutModeProps {
  workoutDay: WorkoutDay;
  profile: UserProfile;
  onFinishWorkout: (session: CompletedSession) => void;
  onCancelWorkout: () => void;
  onOpenRestTimer: (seconds: number) => void;
  onOpenSubstituteModal: (exercise: Exercise) => void;
}

export const ActiveWorkoutMode: React.FC<ActiveWorkoutModeProps> = ({
  workoutDay,
  profile,
  onFinishWorkout,
  onCancelWorkout,
  onOpenRestTimer,
  onOpenSubstituteModal,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const [sessionStartTime] = useState(Date.now());
  const [notes, setNotes] = useState('');

  // Exercise log tracking: record per exercise id -> list of set logs
  const [exerciseLogsMap, setExerciseLogsMap] = useState<Record<string, ExerciseSetLog[]>>({});

  // Input states for current set
  const currentExercise = workoutDay.exercises[currentExerciseIndex];
  const [repsDone, setRepsDone] = useState<number>(10);
  const [loadKg, setLoadKg] = useState<number>(20);

  const [isFinished, setIsFinished] = useState(false);

  if (!currentExercise || isFinished) {
    const totalDurationMin = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));

    const completedSessionData: CompletedSession = {
      id: `sess_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      workoutDayId: workoutDay.id,
      workoutTitle: workoutDay.title,
      durationMinutes: totalDurationMin,
      notes,
      exerciseLogs: workoutDay.exercises.map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: exerciseLogsMap[ex.id] || [],
      })),
    };

    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 p-0.5 mx-auto shadow-md flex items-center justify-center">
          <Trophy className="w-10 h-10 text-blue-600" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            TREINO CONCLUÍDO COM SUCESSO!
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">Excelente Trabalho!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sua constância é a chave para o seu objetivo de {profile.objective}.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left space-y-3 text-xs shadow-sm">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Treino realizado:</span>
            <span className="font-bold text-slate-900">{workoutDay.title}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Duração total:</span>
            <span className="font-bold text-blue-600">{totalDurationMin} minutos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Exercícios registrados:</span>
            <span className="font-bold text-blue-600">{workoutDay.exercises.length} exercícios</span>
          </div>
        </div>

        <button
          onClick={() => onFinishWorkout(completedSessionData)}
          className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-xl shadow-slate-900/10 cursor-pointer transition-all"
        >
          SALVAR E VOLTAR AO PAINEL
        </button>
      </div>
    );
  }

  const totalSetsForCurrentEx = currentExercise.sets || 3;

  const handleCompleteSet = () => {
    const newSetLog: ExerciseSetLog = {
      setIndex: currentSetIndex + 1,
      repsCompleted: Number(repsDone) || 10,
      loadKg: Number(loadKg) || 0,
      completedAt: new Date().toISOString(),
    };

    const existing = exerciseLogsMap[currentExercise.id] || [];
    const updatedMap = {
      ...exerciseLogsMap,
      [currentExercise.id]: [...existing, newSetLog],
    };
    setExerciseLogsMap(updatedMap);

    // Auto trigger rest timer
    onOpenRestTimer(currentExercise.restSeconds || 60);

    // Advance set or exercise
    if (currentSetIndex + 1 < totalSetsForCurrentEx) {
      setCurrentSetIndex(currentSetIndex + 1);
    } else {
      // Move to next exercise if exists
      if (currentExerciseIndex + 1 < workoutDay.exercises.length) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
      } else {
        setIsFinished(true);
      }
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex + 1 < workoutDay.exercises.length) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-in fade-in pb-28">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancelWorkout}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sair do Treino</span>
        </button>

        <span className="text-xs font-bold tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          MODO TREINO ATIVO
        </span>
      </div>

      {/* Progress status */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Exercício {currentExerciseIndex + 1} de {workoutDay.exercises.length}</span>
          <span>Série {currentSetIndex + 1} / {totalSetsForCurrentEx}</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${
                ((currentExerciseIndex * totalSetsForCurrentEx + currentSetIndex) /
                  (workoutDay.exercises.length * totalSetsForCurrentEx)) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* ACTIVE EXERCISE CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 uppercase">
              {currentExercise.muscleGroup}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {currentExercise.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Equipamento: <strong className="text-slate-700">{currentExercise.equipment}</strong>
            </p>
          </div>

          <button
            onClick={() => onOpenSubstituteModal(currentExercise)}
            title="Substituir Exercício por IA"
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Substituir</span>
          </button>
        </div>

        {/* Execution Tip */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <p className="font-bold text-blue-600 mb-0.5">💡 Dica de Execução:</p>
          <p>{currentExercise.executionTip}</p>
        </div>

        {/* SET FOCUS PANEL */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4">
          <div className="flex justify-around items-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Série Atual</span>
              <span className="text-2xl font-black text-blue-600">
                {currentSetIndex + 1} / {totalSetsForCurrentEx}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Meta de Reps</span>
              <span className="text-2xl font-black text-slate-900">{currentExercise.reps}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Descanso</span>
              <span className="text-2xl font-black text-blue-600">{currentExercise.restSeconds}s</span>
            </div>
          </div>

          {/* INPUT FORM FOR CURRENT SET */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Reps Realizadas
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={repsDone}
                onChange={(e) => setRepsDone(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-lg font-black text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Carga (kg)
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={loadKg}
                onChange={(e) => setLoadKg(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-lg font-black text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* CONCLUIR SÉRIE CTA BUTTON */}
          <button
            onClick={handleCompleteSet}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>CONCLUIR SÉRIE ({currentSetIndex + 1}/{totalSetsForCurrentEx})</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => onOpenRestTimer(currentExercise.restSeconds || 60)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Timer className="w-4 h-4 text-blue-600" />
            <span>Iniciar Timer ({currentExercise.restSeconds}s)</span>
          </button>

          <button
            onClick={handleNextExercise}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <span>Próximo Exercício</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes Field */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
        <label className="block text-xs font-bold text-slate-700">
          Observações desta sessão:
        </label>
        <textarea
          rows={2}
          placeholder="Ex: Senti bom pump no peitoral, aumentei a carga na 3ª série..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
        />
      </div>
    </div>
  );
};


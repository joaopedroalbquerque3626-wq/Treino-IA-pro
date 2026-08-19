import React, { useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Timer, ArrowLeft, Trophy, RefreshCw, Plus, Minus } from 'lucide-react';
import { WorkoutDay, Exercise, UserProfile, CompletedSession, ExerciseSetLog } from '../types';

interface ActiveWorkoutModeProps {
  workoutDay: WorkoutDay;
  profile: UserProfile;
  onFinishWorkout: (session: CompletedSession) => void;
  onCancelWorkout: () => void;
  onOpenRestTimer: (seconds: number) => void;
  onOpenSubstituteModal: (exercise: Exercise) => void;
}

const localDate = () => new Date().toLocaleDateString('en-CA');

export const ActiveWorkoutMode: React.FC<ActiveWorkoutModeProps> = ({ workoutDay, profile, onFinishWorkout, onCancelWorkout, onOpenRestTimer, onOpenSubstituteModal }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [notes, setNotes] = useState('');
  const [exerciseLogsMap, setExerciseLogsMap] = useState<Record<string, ExerciseSetLog[]>>({});
  const [repsDone, setRepsDone] = useState<number>(10);
  const [loadKg, setLoadKg] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentExercise = workoutDay.exercises[currentExerciseIndex];
  const totalSetsForCurrentEx = currentExercise?.sets || 0;
  const totalSets = useMemo(() => workoutDay.exercises.reduce((sum, ex) => sum + Math.max(1, ex.sets || 1), 0), [workoutDay.exercises]);
  const completedSetsBeforeCurrent = useMemo(() => workoutDay.exercises.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + Math.max(1, ex.sets || 1), 0), [workoutDay.exercises, currentExerciseIndex]);
  const progress = totalSets > 0 ? Math.min(100, ((completedSetsBeforeCurrent + currentSetIndex) / totalSets) * 100) : 0;

  if (!currentExercise || isFinished) {
    const totalDurationMin = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    const completedSessionData: CompletedSession = {
      id: `sess_${workoutDay.id}_${Date.now()}`,
      date: localDate(),
      timestamp: Date.now(),
      workoutDayId: workoutDay.id,
      workoutTitle: workoutDay.title,
      durationMinutes: totalDurationMin,
      notes: notes.trim(),
      exerciseLogs: workoutDay.exercises.map((ex) => ({ exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup, sets: exerciseLogsMap[ex.id] || [] })),
    };

    return <div className="max-w-md mx-auto px-4 py-8 sm:py-12 text-center space-y-5 animate-in zoom-in-95 pb-28">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 mx-auto shadow-md flex items-center justify-center"><Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" /></div>
      <div><span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">TREINO CONCLUÍDO COM SUCESSO!</span><h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">Excelente Trabalho!</h2><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sua constância é a chave para seu objetivo de {profile.objective}.</p></div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-left space-y-2.5 text-xs shadow-xs transition-colors">
        <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2"><span className="text-slate-500 dark:text-slate-400">Treino realizado:</span><span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{workoutDay.title}</span></div>
        <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2"><span className="text-slate-500 dark:text-slate-400">Duração total:</span><span className="font-bold text-blue-600 dark:text-blue-400">{totalDurationMin} minutos</span></div>
        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Exercícios registrados:</span><span className="font-bold text-blue-600 dark:text-blue-400">{Object.values(exerciseLogsMap).filter(s => s.length > 0).length}</span></div>
      </div>
      <button onClick={() => onFinishWorkout(completedSessionData)} className="w-full min-h-[50px] py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 active:scale-95 cursor-pointer transition-all">SALVAR E VOLTAR AO PAINEL</button>
    </div>;
  }

  const resetInputsForNextExercise = () => { setRepsDone(10); setLoadKg(0); };

  const handleCompleteSet = () => {
    const safeReps = Math.min(100, Math.max(1, Number(repsDone) || 1));
    const safeLoad = Math.min(500, Math.max(0, Number(loadKg) || 0));
    const newSetLog: ExerciseSetLog = { setIndex: currentSetIndex + 1, repsCompleted: safeReps, loadKg: safeLoad, completedAt: new Date().toISOString() };
    const existing = exerciseLogsMap[currentExercise.id] || [];
    setExerciseLogsMap({ ...exerciseLogsMap, [currentExercise.id]: [...existing, newSetLog] });
    if (currentExercise.restSeconds > 0) onOpenRestTimer(currentExercise.restSeconds);
    if (currentSetIndex + 1 < totalSetsForCurrentEx) setCurrentSetIndex((prev) => prev + 1);
    else if (currentExerciseIndex + 1 < workoutDay.exercises.length) { setCurrentExerciseIndex((prev) => prev + 1); setCurrentSetIndex(0); resetInputsForNextExercise(); }
    else setIsFinished(true);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex + 1 < workoutDay.exercises.length) { setCurrentExerciseIndex((prev) => prev + 1); setCurrentSetIndex(0); resetInputsForNextExercise(); }
    else setIsFinished(true);
  };

  return <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-in fade-in pb-28">
    <div className="flex items-center justify-between"><button onClick={onCancelWorkout} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer py-1"><ArrowLeft className="w-4 h-4" /><span>Sair</span></button><span className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">MODO TREINO ATIVO</span></div>
    <div className="space-y-1"><div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium"><span>Exercício {currentExerciseIndex + 1} de {workoutDay.exercises.length}</span><span>Série {currentSetIndex + 1} de {totalSetsForCurrentEx}</span></div><div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div></div>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs relative overflow-hidden transition-colors">
      <div className="flex items-start justify-between gap-2"><div><span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 uppercase">{currentExercise.muscleGroup}</span><h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{currentExercise.name}</h2><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Equipamento: <strong className="text-slate-700 dark:text-slate-300">{currentExercise.equipment}</strong></p></div><button onClick={() => onOpenSubstituteModal(currentExercise)} title="Substituir Exercício" className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer active:scale-95"><RefreshCw className="w-3.5 h-3.5" /><span className="text-[11px]">Trocar</span></button></div>
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"><p className="font-bold text-blue-600 dark:text-blue-400 mb-0.5">💡 Dica de Execução:</p><p>{currentExercise.executionTip}</p></div>
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-3">
        <div className="flex justify-around items-center text-xs"><div><span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold block">Série</span><span className="text-xl font-black text-blue-600 dark:text-blue-400">{currentSetIndex + 1}/{totalSetsForCurrentEx}</span></div><div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-700" /><div><span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold block">Alvo Reps</span><span className="text-xl font-black text-slate-900 dark:text-white">{currentExercise.reps}</span></div><div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-700" /><div><span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold block">Descanso</span><span className="text-xl font-black text-blue-600 dark:text-blue-400">{currentExercise.restSeconds}s</span></div></div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl shadow-xs"><label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Reps Feitas</label><div className="flex items-center justify-between gap-1"><button type="button" onClick={() => setRepsDone(prev => Math.max(1, prev - 1))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 cursor-pointer"><Minus className="w-3.5 h-3.5" /></button><input type="number" min={1} max={100} value={repsDone} onChange={e => setRepsDone(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} className="w-12 bg-transparent text-center text-lg font-black text-slate-900 dark:text-white focus:outline-none" /><button type="button" onClick={() => setRepsDone(prev => Math.min(100, prev + 1))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 cursor-pointer"><Plus className="w-3.5 h-3.5" /></button></div></div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl shadow-xs"><label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Carga (kg)</label><div className="flex items-center justify-between gap-1"><button type="button" onClick={() => setLoadKg(prev => Math.max(0, prev - 2))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 cursor-pointer"><Minus className="w-3.5 h-3.5" /></button><input type="number" min={0} max={500} value={loadKg} onChange={e => setLoadKg(Math.min(500, Math.max(0, Number(e.target.value) || 0)))} className="w-12 bg-transparent text-center text-lg font-black text-slate-900 dark:text-white focus:outline-none" /><button type="button" onClick={() => setLoadKg(prev => Math.min(500, prev + 2))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold active:scale-95 cursor-pointer"><Plus className="w-3.5 h-3.5" /></button></div></div>
        </div>
        <button onClick={handleCompleteSet} className="w-full min-h-[50px] py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"><CheckCircle2 className="w-4 h-4 text-white" /><span>CONCLUIR SÉRIE ({currentSetIndex + 1}/{totalSetsForCurrentEx})</span></button>
      </div>
      <div className="flex justify-between items-center gap-2"><button onClick={() => currentExercise.restSeconds > 0 && onOpenRestTimer(currentExercise.restSeconds)} className="flex-1 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"><Timer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /><span>Timer ({currentExercise.restSeconds}s)</span></button><button onClick={handleNextExercise} className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"><span>Pular Exercício</span><ChevronRight className="w-3.5 h-3.5" /></button></div>
    </div>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-1.5 shadow-xs transition-colors"><label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Observações desta sessão:</label><textarea rows={2} maxLength={500} placeholder="Ex: Senti bom pump, aumentei a carga na 3ª série..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500" /></div>
  </div>;
};

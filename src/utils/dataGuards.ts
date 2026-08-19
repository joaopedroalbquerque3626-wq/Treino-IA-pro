import { CompletedSession, EvolutionLog, UserProfile, WorkoutPlan } from '../types';

const normalize = (value: unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const aliases: Record<string, string[]> = {
  halteres: ['halteres', 'halter', 'dumbbell', 'dumbbells'], anilhas: ['anilha', 'anilhas', 'plates'], barra: ['barra', 'barbell'],
  banco: ['banco', 'bench'], maquinas: ['maquina', 'maquinas', 'machine', 'machines'], 'barra fixa': ['barra fixa', 'pull up', 'pull-up'],
  polia: ['polia', 'cabo', 'crossover'], elastico: ['elastico', 'band', 'bands'],
};
export function equipmentAvailable(required: string, available: string[] = []) {
  const req = normalize(required);
  if (!req || req.includes('peso corporal') || req.includes('corpo')) return true;
  if (available.some(item => normalize(item).includes('todas as maquinas') || normalize(item).includes('maquinas de academia'))) return true;
  return available.some(item => {
    const current = normalize(item);
    if (current.includes(req) || req.includes(current)) return true;
    return Object.values(aliases).some(group => group.some(a => normalize(a) === req) && group.some(a => current.includes(normalize(a))));
  });
}

function exerciseMinutes(sets: number, restSeconds: number) { return Math.max(1, sets) * 1.25 + Math.max(0, sets - 1) * Math.max(0, restSeconds) / 60; }

export function sanitizeWorkoutPlan(plan: WorkoutPlan, profile: UserProfile): WorkoutPlan {
  const requestedDays = Math.max(1, Math.min(7, Math.round(profile.daysPerWeek || 1)));
  const preferred = normalize(profile.preferredExercises).split(',').map(normalize).filter(Boolean);
  const avoided = normalize(profile.avoidExercises).split(',').map(normalize).filter(Boolean);

  const cleanDay = (day: WorkoutPlan['days'][number], index: number) => {
    let exercises = (day.exercises || [])
      .filter(ex => equipmentAvailable(ex.equipment, profile.equipment))
      .filter(ex => !avoided.some(term => normalize(ex.name).includes(term)))
      .sort((a, b) => Number(preferred.some(term => normalize(b.name).includes(term))) - Number(preferred.some(term => normalize(a.name).includes(term))));

    const targetMinutes = Math.max(15, profile.sessionTimeMin || 60) - 5;
    while (exercises.length > 2 && exercises.reduce((sum, ex) => sum + exerciseMinutes(ex.sets, ex.restSeconds), 5) > targetMinutes) exercises = exercises.slice(0, -1);

    return { ...day, dayNumber: index + 1, exercises, estimatedDuration: day.isRestDay ? '0 min' : `${Math.ceil(exercises.reduce((sum, ex) => sum + exerciseMinutes(ex.sets, ex.restSeconds), 5))} min` };
  };

  // Prefer real training days. Only use rest days to fill an incomplete plan.
  const trainingDays = (plan.days || []).filter(day => !day.isRestDay).slice(0, requestedDays).map((day, i) => cleanDay(day, i));
  const restDays = (plan.days || []).filter(day => day.isRestDay);
  const safeDays = [...trainingDays];
  let restIndex = 0;
  while (safeDays.length < requestedDays) {
    const source = restDays[restIndex++];
    safeDays.push(source ? cleanDay(source, safeDays.length) : {
      id: `safe-rest-${safeDays.length + 1}`, dayNumber: safeDays.length + 1, title: `DIA ${safeDays.length + 1} — RECUPERAÇÃO`, isRestDay: true,
      targetGoal: 'Recuperação', estimatedDuration: '0 min', warmup: 'Caminhada leve ou mobilidade confortável.', exercises: [],
    });
  }

  return { ...plan, days: safeDays.slice(0, requestedDays), summary: { ...plan.summary, daysPerWeek: requestedDays, sessionTimeMin: profile.sessionTimeMin, equipment: profile.equipment } };
}

export function sessionAlreadyRecorded(history: CompletedSession[], session: CompletedSession) {
  if (!session) return true;
  return history.some(item => (session.id && item.id === session.id) || (item.date === session.date && item.workoutDayId === session.workoutDayId));
}

export function validEvolutionLog(log: EvolutionLog) {
  if (!log || !Number.isFinite(log.weightKg) || log.weightKg <= 20 || log.weightKg > 400 || !log.id) return false;
  const date = new Date(log.date);
  return !Number.isNaN(date.getTime());
}

export function progressionFromHistory(history: CompletedSession[]) {
  const suggestions: Array<{ exerciseId: string; exerciseName: string; currentLoadKg: number; suggestedLoadKg: number; currentReps: string; suggestedReps: string; reason: string }> = [];
  const exerciseIds = [...new Set(history.flatMap(s => s.exerciseLogs?.map(l => l.exerciseId) || []))];
  exerciseIds.forEach(exerciseId => {
    const logs = [...history].reverse().flatMap(session => session.exerciseLogs?.filter(log => log.exerciseId === exerciseId) || []).slice(0, 4);
    if (logs.length < 2) return;
    const last = logs[0];
    const previous = logs[1];
    const lastLoads = last.sets?.map(s => Number(s.loadKg) || 0).filter(v => v > 0) || [];
    const previousLoads = previous.sets?.map(s => Number(s.loadKg) || 0).filter(v => v > 0) || [];
    const reps = last.sets?.map(s => Number(s.reps) || 0).filter(Boolean) || [];
    if (!lastLoads.length || !reps.length || !reps.every(r => r >= 10)) return;
    const current = Math.max(...lastLoads); const previousLoad = previousLoads.length ? Math.max(...previousLoads) : current;
    if (current < previousLoad) return;
    const suggested = Math.max(current + 1, Math.round(current * 1.05));
    suggestions.push({ exerciseId, exerciseName: last.exerciseName, currentLoadKg: current, suggestedLoadKg: suggested, currentReps: '8–10', suggestedReps: '8–10 com técnica mantida', reason: `Você manteve ou aumentou a carga e bateu pelo menos 10 repetições. Sugestão conservadora: +${suggested - current} kg.` });
  });
  return suggestions.slice(0, 3);
}

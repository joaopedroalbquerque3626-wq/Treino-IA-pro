import { CompletedSession, EvolutionLog, Exercise, UserProfile, WorkoutPlan } from '../types';

const normalize = (value: unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const aliases: Record<string, string[]> = {
  halteres: ['halteres', 'halter', 'dumbbell', 'dumbbells'],
  anilhas: ['anilha', 'anilhas', 'plates'],
  barra: ['barra', 'barbell'],
  banco: ['banco', 'bench'],
  maquinas: ['maquina', 'maquinas', 'machine', 'machines'],
  'barra fixa': ['barra fixa', 'pull up', 'pull-up'],
  polia: ['polia', 'cabo', 'crossover'],
  elastico: ['elastico', 'band', 'bands'],
};

export function equipmentAvailable(required: string, available: string[] = []) {
  const req = normalize(required);
  if (!req || req.includes('peso corporal') || req.includes('peso corporal')) return true;
  if (available.some((item) => normalize(item).includes('todas as maquinas') || normalize(item).includes('maquinas de academia'))) return true;
  return available.some((item) => {
    const current = normalize(item);
    if (current.includes(req) || req.includes(current)) return true;
    return Object.values(aliases).some((group) => group.some((a) => normalize(a) === req) && group.some((a) => current.includes(normalize(a))));
  });
}

export function sanitizeWorkoutPlan(plan: WorkoutPlan, profile: UserProfile): WorkoutPlan {
  const requestedDays = Math.max(1, Math.min(7, Math.round(profile.daysPerWeek || 1)));
  const safeDays = (plan.days || []).slice(0, requestedDays).map((day, index) => ({
    ...day,
    dayNumber: index + 1,
    exercises: (day.exercises || []).filter((exercise) => equipmentAvailable(exercise.equipment, profile.equipment)),
  }));

  while (safeDays.length < requestedDays) {
    safeDays.push({
      id: `safe-rest-${safeDays.length + 1}`,
      dayNumber: safeDays.length + 1,
      title: `DIA ${safeDays.length + 1} — RECUPERAÇÃO`,
      isRestDay: true,
      targetGoal: 'Recuperação',
      estimatedDuration: '0 min',
      warmup: 'Caminhada leve ou mobilidade confortável.',
      exercises: [],
    });
  }

  return { ...plan, days: safeDays, summary: { ...plan.summary, daysPerWeek: requestedDays, sessionTimeMin: profile.sessionTimeMin, equipment: profile.equipment } };
}

export function sessionAlreadyRecorded(history: CompletedSession[], session: CompletedSession) {
  if (!session?.id) return false;
  return history.some((item) => item.id === session.id || (item.date === session.date && item.workoutDayId === session.workoutDayId));
}

export function validEvolutionLog(log: EvolutionLog) {
  if (!log || !Number.isFinite(log.weightKg) || log.weightKg <= 20 || log.weightKg > 400) return false;
  const date = new Date(log.date);
  return !Number.isNaN(date.getTime()) && Boolean(log.id);
}

export function progressionFromHistory(history: CompletedSession[]) {
  const byExercise = new Map<string, CompletedSession['exerciseLogs']>();
  [...history].reverse().forEach((session) => session.exerciseLogs?.forEach((log) => {
    if (!byExercise.has(log.exerciseId)) byExercise.set(log.exerciseId, []);
  }));

  const suggestions: Array<{ exerciseId: string; exerciseName: string; currentLoadKg: number; suggestedLoadKg: number; currentReps: string; suggestedReps: string; reason: string }> = [];
  byExercise.forEach((_logs, exerciseId) => {
    const sessions = [...history].reverse().flatMap((session) => session.exerciseLogs?.filter((log) => log.exerciseId === exerciseId) || []).slice(0, 4);
    if (!sessions.length) return;
    const last = sessions[0];
    const loads = last.sets?.map((set) => Number(set.loadKg) || 0).filter((value) => value > 0) || [];
    const reps = last.sets?.map((set) => Number(set.reps) || 0).filter(Boolean) || [];
    if (!loads.length || !reps.length || !reps.every((value) => value >= 10)) return;
    const current = Math.max(...loads);
    const suggested = Math.max(current + 1, Math.round(current * 1.05));
    suggestions.push({ exerciseId, exerciseName: last.exerciseName, currentLoadKg: current, suggestedLoadKg: suggested, currentReps: '8–10', suggestedReps: '8–10 com técnica mantida', reason: `Desempenho consistente nas últimas sessões. Sugestão conservadora de +${suggested - current} kg, se a técnica continuar boa.` });
  });
  return suggestions.slice(0, 3);
}

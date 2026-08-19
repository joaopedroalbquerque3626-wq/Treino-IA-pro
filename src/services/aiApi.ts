import { Exercise, ExerciseAlternative, UserProfile, WorkoutPlan } from '../types';

async function readError(res: Response) {
  try {
    const data = await res.json();
    return data?.error || `Erro HTTP ${res.status}`;
  } catch {
    return `Erro HTTP ${res.status}`;
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(await readError(res));
    return await res.json() as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchAIPlanGeneration(profile: UserProfile): Promise<WorkoutPlan> {
  return postJson<WorkoutPlan>('/api/generate-plan', { profile });
}

export async function fetchAIPlanTweak(plan: WorkoutPlan, prompt: string, profile: UserProfile): Promise<WorkoutPlan> {
  const result = await postJson<{ plan: WorkoutPlan }>('/api/tweak-plan', { plan, prompt, profile });
  if (!result?.plan?.days?.length) throw new Error('A IA retornou um plano ajustado inválido.');
  return result.plan;
}

export async function fetchAIExerciseAlternatives(exercise: Exercise, profile: UserProfile): Promise<ExerciseAlternative[]> {
  const result = await postJson<{ alternatives: ExerciseAlternative[] }>('/api/substitute-exercise', { exercise, profile });
  return Array.isArray(result.alternatives) ? result.alternatives : [];
}

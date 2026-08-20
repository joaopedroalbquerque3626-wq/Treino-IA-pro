import { Exercise, ExerciseAlternative, UserProfile, WorkoutPlan } from '../types';

const REQUEST_TIMEOUT_MS = 30000;

async function readError(res: Response) {
  try {
    const data = await res.json();
    return data?.error || `Erro HTTP ${res.status}`;
  } catch {
    return `Erro HTTP ${res.status}`;
  }
}

function normalizeRequestError(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new Error('A IA demorou mais do que o esperado. Tente novamente em alguns segundos.');
  }
  if (error instanceof TypeError) {
    return new Error('Não foi possível conectar ao serviço de IA. Verifique sua conexão e tente novamente.');
  }
  return error instanceof Error ? error : new Error('Falha inesperada ao acessar a IA.');
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      credentials: 'same-origin',
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(await readError(res));

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('O servidor retornou uma resposta inválida.');
    }

    return await res.json() as T;
  } catch (error) {
    throw normalizeRequestError(error);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function fetchAIPlanGeneration(profile: UserProfile): Promise<WorkoutPlan> {
  const result = await postJson<WorkoutPlan>('/api/generate-plan', { profile });
  if (!result?.days?.length) throw new Error('A IA retornou um plano inválido.');
  return result;
}

export async function fetchAIPlanTweak(plan: WorkoutPlan, prompt: string, profile: UserProfile): Promise<WorkoutPlan> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) throw new Error('Informe o ajuste que deseja fazer no plano.');
  const result = await postJson<{ plan: WorkoutPlan }>('/api/tweak-plan', { plan, prompt: cleanPrompt, profile });
  if (!result?.plan?.days?.length) throw new Error('A IA retornou um plano ajustado inválido.');
  return result.plan;
}

export async function fetchAIExerciseAlternatives(exercise: Exercise, profile: UserProfile): Promise<ExerciseAlternative[]> {
  const result = await postJson<{ alternatives: ExerciseAlternative[] }>('/api/substitute-exercise', { exercise, profile });
  return Array.isArray(result.alternatives) ? result.alternatives.slice(0, 3) : [];
}

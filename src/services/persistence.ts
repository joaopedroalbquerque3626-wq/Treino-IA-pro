import { CompletedSession, EvolutionLog, UserProfile, WorkoutPlan } from '../types';

const SNAPSHOT_KEY = 'treino_ia_pro_account_v1';
const LEGACY_PROFILE_KEY = 'treino_ia_pro_profile';
const LEGACY_PLAN_KEY = 'treino_ia_pro_plan';
const LEGACY_HISTORY_KEY = 'treino_ia_pro_history';
const LEGACY_EVOLUTION_KEY = 'treino_ia_pro_evolution';

export interface PersistedAccountState {
  version: 1;
  profile: UserProfile | null;
  workoutPlan: WorkoutPlan | null;
  history: CompletedSession[];
  evolutionLogs: EvolutionLog[];
  savedAt: string;
}

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function isValidProfile(profile: UserProfile | null): profile is UserProfile {
  return Boolean(
    profile &&
    typeof profile === 'object' &&
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    Number.isFinite(profile.age) &&
    Number.isFinite(profile.height) &&
    Number.isFinite(profile.weight) &&
    Array.isArray(profile.equipment),
  );
}

export function loadPersistedAccount(): PersistedAccountState {
  if (typeof window === 'undefined') {
    return { version: 1, profile: null, workoutPlan: null, history: [], evolutionLogs: [], savedAt: '' };
  }

  try {
    const snapshot = parseJSON<PersistedAccountState | null>(localStorage.getItem(SNAPSHOT_KEY), null);
    if (snapshot && snapshot.version === 1 && (!snapshot.profile || isValidProfile(snapshot.profile))) {
      return {
        version: 1,
        profile: snapshot.profile ?? null,
        workoutPlan: snapshot.workoutPlan ?? null,
        history: Array.isArray(snapshot.history) ? snapshot.history : [],
        evolutionLogs: Array.isArray(snapshot.evolutionLogs) ? snapshot.evolutionLogs : [],
        savedAt: snapshot.savedAt || '',
      };
    }

    // Migração automática das chaves antigas já usadas pelo app.
    const profile = parseJSON<UserProfile | null>(localStorage.getItem(LEGACY_PROFILE_KEY), null);
    const workoutPlan = parseJSON<WorkoutPlan | null>(localStorage.getItem(LEGACY_PLAN_KEY), null);
    const history = parseJSON<CompletedSession[]>(localStorage.getItem(LEGACY_HISTORY_KEY), []);
    const evolutionLogs = parseJSON<EvolutionLog[]>(localStorage.getItem(LEGACY_EVOLUTION_KEY), []);

    return {
      version: 1,
      profile: isValidProfile(profile) ? profile : null,
      workoutPlan,
      history: Array.isArray(history) ? history : [],
      evolutionLogs: Array.isArray(evolutionLogs) ? evolutionLogs : [],
      savedAt: '',
    };
  } catch {
    return { version: 1, profile: null, workoutPlan: null, history: [], evolutionLogs: [], savedAt: '' };
  }
}

export function savePersistedAccount(state: Omit<PersistedAccountState, 'version' | 'savedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const snapshot: PersistedAccountState = {
      version: 1,
      ...state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));

    // Mantém compatibilidade com versões anteriores do app.
    if (state.profile) localStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify(state.profile));
    if (state.workoutPlan) localStorage.setItem(LEGACY_PLAN_KEY, JSON.stringify(state.workoutPlan));
    localStorage.setItem(LEGACY_HISTORY_KEY, JSON.stringify(state.history));
    localStorage.setItem(LEGACY_EVOLUTION_KEY, JSON.stringify(state.evolutionLogs));
  } catch (error) {
    console.error('Não foi possível salvar os dados locais do TREINO IA PRO:', error);
  }
}

import { CompletedSession, EvolutionLog, UserProfile, WorkoutPlan } from '../types';

const SNAPSHOT_KEY = 'treino_ia_pro_account_v1';
const LEGACY_PROFILE_KEY = 'treino_ia_pro_profile';
const LEGACY_PLAN_KEY = 'treino_ia_pro_plan';
const LEGACY_HISTORY_KEY = 'treino_ia_pro_history';
const LEGACY_EVOLUTION_KEY = 'treino_ia_pro_evolution';
const MAX_HISTORY_ITEMS = 1000;
const MAX_EVOLUTION_ITEMS = 1000;

export interface PersistedAccountState {
  version: 1;
  profile: UserProfile | null;
  workoutPlan: WorkoutPlan | null;
  history: CompletedSession[];
  evolutionLogs: EvolutionLog[];
  savedAt: string;
}

function emptyState(): PersistedAccountState {
  return { version: 1, profile: null, workoutPlan: null, history: [], evolutionLogs: [], savedAt: '' };
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
    profile.id.length > 0 &&
    typeof profile.name === 'string' &&
    Number.isFinite(profile.age) &&
    Number.isFinite(profile.height) &&
    Number.isFinite(profile.weight) &&
    Array.isArray(profile.equipment),
  );
}

function isValidPlan(plan: WorkoutPlan | null): plan is WorkoutPlan {
  return Boolean(plan && typeof plan === 'object' && typeof plan.id === 'string' && Array.isArray(plan.days));
}

function sanitizeHistory(value: unknown): CompletedSession[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CompletedSession => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.date === 'string' && Array.isArray(item.exerciseLogs)))
    .slice(-MAX_HISTORY_ITEMS);
}

function sanitizeEvolution(value: unknown): EvolutionLog[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is EvolutionLog => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.date === 'string' && Number.isFinite(item.weightKg)))
    .slice(-MAX_EVOLUTION_ITEMS);
}

function removeLegacyKeys() {
  try {
    localStorage.removeItem(LEGACY_PROFILE_KEY);
    localStorage.removeItem(LEGACY_PLAN_KEY);
    localStorage.removeItem(LEGACY_HISTORY_KEY);
    localStorage.removeItem(LEGACY_EVOLUTION_KEY);
  } catch {
    // Storage may be unavailable in restrictive/private browsing modes.
  }
}

export function loadPersistedAccount(): PersistedAccountState {
  if (typeof window === 'undefined') return emptyState();

  try {
    const snapshot = parseJSON<PersistedAccountState | null>(localStorage.getItem(SNAPSHOT_KEY), null);
    if (snapshot && snapshot.version === 1 && (!snapshot.profile || isValidProfile(snapshot.profile))) {
      return {
        version: 1,
        profile: snapshot.profile ?? null,
        workoutPlan: isValidPlan(snapshot.workoutPlan) ? snapshot.workoutPlan : null,
        history: sanitizeHistory(snapshot.history),
        evolutionLogs: sanitizeEvolution(snapshot.evolutionLogs),
        savedAt: typeof snapshot.savedAt === 'string' ? snapshot.savedAt : '',
      };
    }

    // Migração automática das chaves antigas já usadas pelo app.
    const profile = parseJSON<UserProfile | null>(localStorage.getItem(LEGACY_PROFILE_KEY), null);
    const workoutPlan = parseJSON<WorkoutPlan | null>(localStorage.getItem(LEGACY_PLAN_KEY), null);
    const history = parseJSON<CompletedSession[]>(localStorage.getItem(LEGACY_HISTORY_KEY), []);
    const evolutionLogs = parseJSON<EvolutionLog[]>(localStorage.getItem(LEGACY_EVOLUTION_KEY), []);

    const migrated: PersistedAccountState = {
      version: 1,
      profile: isValidProfile(profile) ? profile : null,
      workoutPlan: isValidPlan(workoutPlan) ? workoutPlan : null,
      history: sanitizeHistory(history),
      evolutionLogs: sanitizeEvolution(evolutionLogs),
      savedAt: '',
    };

    if (migrated.profile || migrated.workoutPlan || migrated.history.length || migrated.evolutionLogs.length) {
      try {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ ...migrated, savedAt: new Date().toISOString() }));
        removeLegacyKeys();
      } catch {
        // Continue with in-memory migrated data if writing fails.
      }
    }

    return migrated;
  } catch {
    return emptyState();
  }
}

export function savePersistedAccount(state: Omit<PersistedAccountState, 'version' | 'savedAt'>) {
  if (typeof window === 'undefined') return false;

  const snapshot: PersistedAccountState = {
    version: 1,
    profile: state.profile,
    workoutPlan: state.workoutPlan,
    history: sanitizeHistory(state.history),
    evolutionLogs: sanitizeEvolution(state.evolutionLogs),
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
    removeLegacyKeys();
    return true;
  } catch (error) {
    console.error('Não foi possível salvar os dados locais do TREINO IA PRO:', error);
    return false;
  }
}

export function clearPersistedAccount() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SNAPSHOT_KEY);
    removeLegacyKeys();
  } catch (error) {
    console.error('Não foi possível remover os dados locais do TREINO IA PRO:', error);
  }
}

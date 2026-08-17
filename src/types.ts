export type ThemeMode = 'light' | 'dark' | 'system';

export type Objective =
  | 'Ganho de massa muscular'
  | 'Perda de gordura'
  | 'Ganho de força'
  | 'Condicionamento físico'
  | 'Manutenção';

export type ExperienceLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export type WorkoutLocation = 'Academia' | 'Casa' | 'Ao ar livre';

export interface HealthSafetyInfo {
  injuries: string;
  persistentPain: string;
  diseases: string;
  recentSurgeries: string;
  physicalLimitations: string;
  exerciseSymptoms: string;
  hasCondition: boolean;
  acceptedTerms: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  objective: Objective;
  experience: ExperienceLevel;
  location: WorkoutLocation;
  equipment: string[];
  daysPerWeek: number; // 2..7
  sessionTimeMin: number; // 15..120
  preferredExercises: string;
  avoidExercises: string;
  observations: string;
  healthSafety: HealthSafetyInfo;
  createdAt: string;
}

export interface ExerciseSetLog {
  setIndex: number;
  repsCompleted: number;
  loadKg: number;
  completedAt?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string; // e.g. "8–12"
  restSeconds: number;
  executionTip: string;
  equipment: string;
  isCompleted?: boolean;
  setLogs?: ExerciseSetLog[];
}

export interface WorkoutDay {
  id: string;
  dayNumber: number; // 1..N
  title: string; // e.g. "DIA 1 — PEITO + TRÍCEPS"
  isRestDay: boolean;
  targetGoal: string;
  estimatedDuration: string; // e.g. "50 min"
  warmup: string; // e.g. "5 min de esteira + mobilidade de ombros"
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  summary: {
    objective: Objective;
    experience: ExperienceLevel;
    daysPerWeek: number;
    sessionTimeMin: number;
    location: WorkoutLocation;
    equipment: string[];
  };
  days: WorkoutDay[];
  aiAnalysisNotes?: string;
}

export interface CompletedExerciseLog {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: ExerciseSetLog[];
}

export interface CompletedSession {
  id: string;
  date: string; // "YYYY-MM-DD"
  timestamp: number;
  workoutDayId: string;
  workoutTitle: string;
  durationMinutes: number;
  exerciseLogs: CompletedExerciseLog[];
  notes: string;
}

export interface EvolutionLog {
  id: string;
  date: string; // "YYYY-MM-DD"
  weightKg: number;
  chestCm?: number;
  armsCm?: number;
  waistCm?: number;
  thighsCm?: number;
  notes?: string;
  photoUrl?: string;
}

export interface NotificationSettings {
  workoutReminders: boolean;
  missedWorkoutAlerts: boolean;
  evolutionLogReminders: boolean;
  weeklySummary: boolean;
  reminderTime: string; // e.g. "08:00"
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ExerciseAlternative {
  originalName: string;
  alternativeName: string;
  muscleGroup: string;
  requiredEquipment: string;
  reason: string;
}

export interface ProgressionSuggestion {
  exerciseId: string;
  exerciseName: string;
  currentLoadKg: number;
  suggestedLoadKg: number;
  currentReps: string;
  suggestedReps: string;
  reason: string;
}

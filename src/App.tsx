import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  WorkoutPlan,
  CompletedSession,
  EvolutionLog,
  Exercise,
  WorkoutDay,
  ProgressionSuggestion,
  ThemeMode,
} from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './components/LandingPage';
import { QuestionnaireWizard } from './components/QuestionnaireWizard';
import { SafetyDisclaimerModal } from './components/SafetyDisclaimerModal';
import { DashboardView } from './components/DashboardView';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { ActiveWorkoutMode } from './components/ActiveWorkoutMode';
import { RestTimerModal } from './components/RestTimerModal';
import { SubstituteModal } from './components/SubstituteModal';
import { EvolutionView } from './components/EvolutionView';
import { CalendarView } from './components/CalendarView';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { NotificationsModal } from './components/NotificationsModal';
import {
  fetchAIPlanGeneration,
  generateLocalWorkoutPlan,
  fetchAIPlanTweak,
} from './services/workoutEngine';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('treino_ia_pro_theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') return savedTheme as ThemeMode;
      return 'system';
    } catch {
      return 'system';
    }
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('treino_ia_pro_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(() => {
    try {
      const saved = localStorage.getItem('treino_ia_pro_plan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [history, setHistory] = useState<CompletedSession[]>(() => {
    try {
      const saved = localStorage.getItem('treino_ia_pro_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [evolutionLogs, setEvolutionLogs] = useState<EvolutionLog[]>(() => {
    try {
      const saved = localStorage.getItem('treino_ia_pro_evolution');
      if (saved) return JSON.parse(saved);
      // Never invent a user's weight. Use the questionnaire/profile value when available.
      if (profile?.weight) {
        return [{
          id: 'evo_init',
          date: new Date().toISOString().split('T')[0],
          weightKg: profile.weight,
          notes: 'Medida inicial informada no perfil',
        }];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => profile && workoutPlan ? 'dashboard' : 'landing');
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [restTimerState, setRestTimerState] = useState<{ isOpen: boolean; seconds: number }>({ isOpen: false, seconds: 60 });
  const [substituteModalState, setSubstituteModalState] = useState<{ isOpen: boolean; exercise: Exercise | null }>({ isOpen: false, exercise: null });
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<WorkoutDay | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('treino_ia_pro_theme', themeMode);
      const root = document.documentElement;
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applyTheme = () => {
        const dark = themeMode === 'dark' || (themeMode === 'system' && mediaQuery.matches);
        root.classList.toggle('dark', dark);
      };
      applyTheme();
      const handleMediaChange = () => themeMode === 'system' && applyTheme();
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    } catch {
      // Theme persistence is non-critical.
    }
  }, [themeMode]);

  useEffect(() => { if (profile) localStorage.setItem('treino_ia_pro_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { if (workoutPlan) localStorage.setItem('treino_ia_pro_plan', JSON.stringify(workoutPlan)); }, [workoutPlan]);
  useEffect(() => { localStorage.setItem('treino_ia_pro_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('treino_ia_pro_evolution', JSON.stringify(evolutionLogs)); }, [evolutionLogs]);

  // If the user completes the questionnaire later, create the initial evolution record from the actual profile weight.
  useEffect(() => {
    if (!profile?.weight || evolutionLogs.length > 0) return;
    setEvolutionLogs([{
      id: `evo_init_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: profile.weight,
      notes: 'Medida inicial informada no perfil',
    }]);
  }, [profile, evolutionLogs.length]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    });
  };

  const computeStreakDays = () => {
    if (history.length === 0) return 0;
    const toLocalDay = (value: string | Date) => {
      const d = new Date(value);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };
    const dates = Array.from(new Set(history.map((h) => toLocalDay(h.date).getTime())))
      .sort((a, b) => b - a);
    if (!dates.length) return 0;
    const today = toLocalDay(new Date()).getTime();
    const yesterday = today - 86400000;
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      if (dates[i - 1] - dates[i] === 86400000) streak++;
      else break;
    }
    return streak;
  };

  const computeProgressionSuggestions = (): ProgressionSuggestion[] => {
    if (history.length < 1) return [];
    const recentSession = history[history.length - 1];
    const suggestions: ProgressionSuggestion[] = [];
    recentSession.exerciseLogs.forEach((exLog) => {
      const sets = exLog.sets || [];
      const maxLoad = Math.max(...sets.map((s) => s.loadKg || 0), 0);
      const reps = sets.map((s) => Number(s.reps) || 0).filter(Boolean);
      const allSetsStrong = reps.length > 0 && reps.every((r) => r >= 10);
      if (maxLoad > 0 && allSetsStrong) {
        const suggested = Math.max(maxLoad + 1, Math.round(maxLoad * 1.05));
        suggestions.push({
          exerciseId: exLog.exerciseId,
          exerciseName: exLog.exerciseName,
          currentLoadKg: maxLoad,
          suggestedLoadKg: suggested,
          currentReps: '8–10',
          suggestedReps: '8–10 com técnica mantida',
          reason: `Você atingiu pelo menos 10 repetições em todas as séries registradas. Sugestão conservadora: +${suggested - maxLoad}kg, mantendo a técnica.`,
        });
      }
    });
    return suggestions.slice(0, 3);
  };

  const handleQuestionnaireComplete = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setLoadingPlan(true);
    setActiveTab('workouts');
    try {
      const generatedPlan = await fetchAIPlanGeneration(userProfile);
      setWorkoutPlan(generatedPlan);
    } catch (err) {
      console.error('API Plan Generation failed, using local fallback:', err);
      setWorkoutPlan(generateLocalWorkoutPlan(userProfile));
    } finally {
      setLoadingPlan(false);
      setActiveTab('dashboard');
    }
  };

  const handleLoginDemo = () => {
    if (profile && workoutPlan) {
      setActiveTab('dashboard');
      return;
    }
    const demoProfile: UserProfile = {
      id: `usr_demo_${Date.now()}`, name: 'Lucas Silva', age: 28, height: 178, weight: 76,
      objective: 'Ganho de massa muscular', experience: 'Intermediário', location: 'Academia',
      equipment: ['Anilhas e Halteres', 'Máquinas de Academia', 'Barra Fixa', 'Banco Inclinável'],
      daysPerWeek: 4, sessionTimeMin: 55, preferredExercises: 'Supino reto, puxada frontal, agachamento livre',
      avoidExercises: '', observations: 'Foco em hipertrofia com boa progressão de cargas',
      healthSafety: { injuries: '', persistentPain: '', diseases: '', recentSurgeries: '', physicalLimitations: '', exerciseSymptoms: '', hasCondition: false, acceptedTerms: true },
      createdAt: new Date().toISOString(),
    };
    setProfile(demoProfile);
    setWorkoutPlan(generateLocalWorkoutPlan(demoProfile));
    setActiveTab('dashboard');
  };

  const handleRegeneratePlan = async () => {
    if (!profile) return;
    setLoadingPlan(true);
    try {
      setWorkoutPlan(await fetchAIPlanGeneration(profile));
      setActiveTab('workouts');
    } catch (err) {
      console.error('Regeneration failed:', err);
      setWorkoutPlan(generateLocalWorkoutPlan(profile));
      setActiveTab('workouts');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleCustomPlanTweak = async (promptText: string) => {
    if (!profile || !workoutPlan) return;
    setLoadingPlan(true);
    try {
      setWorkoutPlan(await fetchAIPlanTweak(workoutPlan, promptText, profile));
    } catch (err) {
      console.error('Plan tweak failed:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleStartWorkout = (dayId: string) => {
    if (!workoutPlan) return;
    const targetDay = workoutPlan.days.find((d) => d.id === dayId);
    if (targetDay && !targetDay.isRestDay) {
      setActiveWorkoutDay(targetDay);
      setActiveTab('active-workout');
    }
  };

  const handleFinishWorkout = (completedSession: CompletedSession) => {
    setHistory((prev) => [...prev, completedSession]);
    setActiveWorkoutDay(null);
    setActiveTab('dashboard');
  };

  const handleSelectAlternative = (oldExerciseId: string, newExercise: Exercise) => {
    if (!workoutPlan) return;
    const updatedDays = workoutPlan.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => ex.id === oldExerciseId ? newExercise : ex),
    }));
    const updatedPlan = { ...workoutPlan, days: updatedDays };
    setWorkoutPlan(updatedPlan);
    if (activeWorkoutDay) {
      const updatedActiveDay = updatedDays.find((d) => d.id === activeWorkoutDay.id);
      if (updatedActiveDay) setActiveWorkoutDay(updatedActiveDay);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <Navbar profile={profile} activeTab={activeTab} onNavigate={setActiveTab} streakDays={computeStreakDays()} onOpenNotifications={() => setNotificationsOpen(true)} onOpenSafety={() => setSafetyModalOpen(true)} themeMode={themeMode} onToggleTheme={handleToggleTheme} onLoginDemo={handleLoginDemo} />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {activeTab === 'landing' && <LandingPage onStartQuestionnaire={() => setActiveTab('questionnaire')} onLoginDemo={handleLoginDemo} onOpenSafety={() => setSafetyModalOpen(true)} />}
        {activeTab === 'questionnaire' && <QuestionnaireWizard onComplete={handleQuestionnaireComplete} onCancel={() => setActiveTab(profile ? 'dashboard' : 'landing')} />}
        {activeTab === 'dashboard' && profile && <DashboardView profile={profile} workoutPlan={workoutPlan} history={history} streakDays={computeStreakDays()} onStartWorkout={handleStartWorkout} onNavigate={setActiveTab} onRegeneratePlan={handleRegeneratePlan} />}
        {activeTab === 'workouts' && profile && workoutPlan && <WorkoutPlanView plan={workoutPlan} profile={profile} onStartWorkout={handleStartWorkout} onOpenSubstituteModal={(ex) => setSubstituteModalState({ isOpen: true, exercise: ex })} onCustomPlanPrompt={handleCustomPlanTweak} loadingRegen={loadingPlan} />}
        {activeTab === 'active-workout' && profile && activeWorkoutDay && <ActiveWorkoutMode workoutDay={activeWorkoutDay} profile={profile} onFinishWorkout={handleFinishWorkout} onCancelWorkout={() => setActiveTab('dashboard')} onOpenRestTimer={(seconds) => setRestTimerState({ isOpen: true, seconds })} onOpenSubstituteModal={(ex) => setSubstituteModalState({ isOpen: true, exercise: ex })} />}
        {activeTab === 'evolution' && profile && <EvolutionView profile={profile} evolutionLogs={evolutionLogs} history={history} onAddEvolutionLog={(newLog) => setEvolutionLogs((prev) => [...prev, newLog])} />}
        {activeTab === 'calendar' && <CalendarView history={history} />}
        {activeTab === 'history' && <HistoryView history={history} />}
        {activeTab === 'profile' && profile && <ProfileView profile={profile} onUpdateProfile={setProfile} onRegeneratePlan={handleRegeneratePlan} />}
      </main>
      {profile && <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />}
      <SafetyDisclaimerModal isOpen={safetyModalOpen} onClose={() => setSafetyModalOpen(false)} />
      <NotificationsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <RestTimerModal isOpen={restTimerState.isOpen} seconds={restTimerState.seconds} onClose={() => setRestTimerState((s) => ({ ...s, isOpen: false }))} />
      <SubstituteModal isOpen={substituteModalState.isOpen} exercise={substituteModalState.exercise} profile={profile} onClose={() => setSubstituteModalState({ isOpen: false, exercise: null })} onSelectAlternative={handleSelectAlternative} />
    </div>
  );
}

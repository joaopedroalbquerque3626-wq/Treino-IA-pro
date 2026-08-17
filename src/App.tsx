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
import { AICoachChat } from './components/AICoachChat';
import { NotificationsModal } from './components/NotificationsModal';
import {
  fetchAIPlanGeneration,
  generateLocalWorkoutPlan,
  fetchAIPlanTweak,
} from './services/workoutEngine';

export default function App() {
  // THEME MANAGEMENT STATE
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('treino_ia_pro_theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        return savedTheme as ThemeMode;
      }
      return 'system';
    } catch {
      return 'system';
    }
  });

  // PERSISTED LOCAL STORAGE STATES
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
      // Default initial weight log if profile exists
      return [
        {
          id: 'evo_init',
          date: new Date().toISOString().split('T')[0],
          weightKg: 75,
          notes: 'Medida inicial',
        },
      ];
    } catch {
      return [];
    }
  });

  // NAVIGATION TAB STATE
  const [activeTab, setActiveTab] = useState<string>(() => {
    return profile && workoutPlan ? 'dashboard' : 'landing';
  });

  // MODAL STATES
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [restTimerState, setRestTimerState] = useState<{ isOpen: boolean; seconds: number }>({
    isOpen: false,
    seconds: 60,
  });
  const [substituteModalState, setSubstituteModalState] = useState<{
    isOpen: boolean;
    exercise: Exercise | null;
  }>({
    isOpen: false,
    exercise: null,
  });

  const [activeWorkoutDay, setActiveWorkoutDay] = useState<WorkoutDay | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // THEME EFFECT: Update root document element class
  useEffect(() => {
    localStorage.setItem('treino_ia_pro_theme', themeMode);

    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (themeMode === 'dark') {
        root.classList.add('dark');
      } else if (themeMode === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    const handleMediaChange = () => {
      if (themeMode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [themeMode]);

  // SAVE STATES TO LOCAL STORAGE
  useEffect(() => {
    if (profile) localStorage.setItem('treino_ia_pro_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (workoutPlan) localStorage.setItem('treino_ia_pro_plan', JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    localStorage.setItem('treino_ia_pro_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('treino_ia_pro_evolution', JSON.stringify(evolutionLogs));
  }, [evolutionLogs]);

  // TOGGLE THEME HELPER (For navbar quick button)
  const handleToggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      // If currently system, toggle based on current active class
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      return isCurrentlyDark ? 'light' : 'dark';
    });
  };

  // STREAK COMPUTATION
  const computeStreakDays = () => {
    if (history.length === 0) return 0;
    const sortedDates = [...history]
      .map((h) => h.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const uniqueDates = Array.from(new Set(sortedDates));
    let streak = 0;
    let curr = new Date();

    for (let i = 0; i < uniqueDates.length; i++) {
      const d = new Date(uniqueDates[i]);
      const diffInDays = Math.floor((curr.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffInDays <= 1) {
        streak++;
        curr = d;
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  };

  // PROGRESSION SUGGESTIONS COMPUTATION
  const computeProgressionSuggestions = (): ProgressionSuggestion[] => {
    if (history.length < 2) return [];
    const suggestions: ProgressionSuggestion[] = [];

    // Analyze last completed sessions
    const recentSession = history[history.length - 1];
    recentSession.exerciseLogs.forEach((exLog) => {
      const maxLoad = Math.max(...exLog.sets.map((s) => s.loadKg || 0), 0);
      if (maxLoad > 0) {
        suggestions.push({
          exerciseId: exLog.exerciseId,
          exerciseName: exLog.exerciseName,
          currentLoadKg: maxLoad,
          suggestedLoadKg: Math.round(maxLoad * 1.05 + 1), // +5% progression
          currentReps: '8–10',
          suggestedReps: '8–10 com técnica mantida',
          reason: `Você completou todas as séries com facilidade no treino de ${recentSession.date}. Recomendamos subir +${Math.round(maxLoad * 0.05 + 1)}kg.`,
        });
      }
    });

    return suggestions.slice(0, 3);
  };

  // QUESTIONNAIRE COMPLETE HANDLER
  const handleQuestionnaireComplete = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setLoadingPlan(true);
    setActiveTab('workouts');

    try {
      const generatedPlan = await fetchAIPlanGeneration(userProfile);
      setWorkoutPlan(generatedPlan);
    } catch (err) {
      console.error('API Plan Generation failed, using local fallback:', err);
      const fallback = generateLocalWorkoutPlan(userProfile);
      setWorkoutPlan(fallback);
    } finally {
      setLoadingPlan(false);
      setActiveTab('dashboard');
    }
  };

  // DEMO LOGIN HANDLER
  const handleLoginDemo = () => {
    if (profile && workoutPlan) {
      setActiveTab('dashboard');
      return;
    }

    const demoProfile: UserProfile = {
      id: `usr_demo_${Date.now()}`,
      name: 'Lucas Silva',
      age: 28,
      height: 178,
      weight: 76,
      objective: 'Ganho de massa muscular',
      experience: 'Intermediário',
      location: 'Academia',
      equipment: ['Anilhas e Halteres', 'Máquinas de Academia', 'Barra Fixa', 'Banco Inclinável'],
      daysPerWeek: 4,
      sessionTimeMin: 55,
      preferredExercises: 'Supino reto, puxada frontal, agachamento livre',
      avoidExercises: '',
      observations: 'Foco em hipertrofia com boa progressão de cargas',
      healthSafety: {
        injuries: '',
        persistentPain: '',
        diseases: '',
        recentSurgeries: '',
        physicalLimitations: '',
        exerciseSymptoms: '',
        hasCondition: false,
        acceptedTerms: true,
      },
      createdAt: new Date().toISOString(),
    };

    const demoPlan = generateLocalWorkoutPlan(demoProfile);
    setProfile(demoProfile);
    setWorkoutPlan(demoPlan);
    setActiveTab('dashboard');
  };

  // REGENERATE PLAN HANDLER
  const handleRegeneratePlan = async () => {
    if (!profile) return;
    setLoadingPlan(true);
    try {
      const newPlan = await fetchAIPlanGeneration(profile);
      setWorkoutPlan(newPlan);
      setActiveTab('workouts');
    } catch (err) {
      console.error('Regeneration failed:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  // CUSTOM PLAN TWEAK HANDLER
  const handleCustomPlanTweak = async (promptText: string) => {
    if (!profile || !workoutPlan) return;
    setLoadingPlan(true);
    try {
      const tweakedPlan = await fetchAIPlanTweak(workoutPlan, promptText, profile);
      setWorkoutPlan(tweakedPlan);
    } catch (err) {
      console.error('Plan tweak failed:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  // START WORKOUT SESSION HANDLER
  const handleStartWorkout = (dayId: string) => {
    if (!workoutPlan) return;
    const targetDay = workoutPlan.days.find((d) => d.id === dayId);
    if (targetDay && !targetDay.isRestDay) {
      setActiveWorkoutDay(targetDay);
      setActiveTab('active-workout');
    }
  };

  // FINISH WORKOUT SESSION HANDLER
  const handleFinishWorkout = (completedSession: CompletedSession) => {
    setHistory((prev) => [...prev, completedSession]);
    setActiveWorkoutDay(null);
    setActiveTab('dashboard');
  };

  // SUBSTITUTE EXERCISE IN ACTIVE WORKOUT DAY / PLAN
  const handleSelectAlternative = (oldExerciseId: string, newExercise: Exercise) => {
    if (!workoutPlan) return;

    const updatedDays = workoutPlan.days.map((day) => {
      const updatedExercises = day.exercises.map((ex) => {
        if (ex.id === oldExerciseId) {
          return newExercise;
        }
        return ex;
      });
      return { ...day, exercises: updatedExercises };
    });

    const updatedPlan = { ...workoutPlan, days: updatedDays };
    setWorkoutPlan(updatedPlan);

    if (activeWorkoutDay) {
      const updatedActiveDay = updatedDays.find((d) => d.id === activeWorkoutDay.id);
      if (updatedActiveDay) setActiveWorkoutDay(updatedActiveDay);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* GLOBAL NAVBAR */}
      <Navbar
        profile={profile}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        streakDays={computeStreakDays()}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenSafety={() => setSafetyModalOpen(true)}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onLoginDemo={handleLoginDemo}
      />

      {/* MAIN VIEW CONTROLLER */}
      <main className="flex-1">
        {/* LANDING PAGE */}
        {activeTab === 'landing' && (
          <LandingPage
            onStartQuestionnaire={() => setActiveTab('questionnaire')}
            onLoginDemo={handleLoginDemo}
            onOpenSafety={() => setSafetyModalOpen(true)}
          />
        )}

        {/* QUESTIONNAIRE WIZARD */}
        {activeTab === 'questionnaire' && (
          <QuestionnaireWizard
            onComplete={handleQuestionnaireComplete}
            onCancel={() => setActiveTab(profile ? 'dashboard' : 'landing')}
          />
        )}

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && profile && (
          <DashboardView
            profile={profile}
            workoutPlan={workoutPlan}
            history={history}
            streakDays={computeStreakDays()}
            onStartWorkout={handleStartWorkout}
            onNavigate={setActiveTab}
            onRegeneratePlan={handleRegeneratePlan}
          />
        )}

        {/* WORKOUT PLAN PAGE */}
        {activeTab === 'workouts' && profile && workoutPlan && (
          <WorkoutPlanView
            plan={workoutPlan}
            profile={profile}
            onStartWorkout={handleStartWorkout}
            onOpenSubstituteModal={(ex) => setSubstituteModalState({ isOpen: true, exercise: ex })}
            onCustomPlanPrompt={handleCustomPlanTweak}
            loadingRegen={loadingPlan}
          />
        )}

        {/* ACTIVE WORKOUT MODE */}
        {activeTab === 'active-workout' && profile && activeWorkoutDay && (
          <ActiveWorkoutMode
            workoutDay={activeWorkoutDay}
            profile={profile}
            onFinishWorkout={handleFinishWorkout}
            onCancelWorkout={() => setActiveTab('dashboard')}
            onOpenRestTimer={(seconds) => setRestTimerState({ isOpen: true, seconds })}
            onOpenSubstituteModal={(ex) => setSubstituteModalState({ isOpen: true, exercise: ex })}
          />
        )}

        {/* EVOLUTION PAGE */}
        {activeTab === 'evolution' && profile && (
          <EvolutionView
            profile={profile}
            evolutionLogs={evolutionLogs}
            history={history}
            onAddEvolutionLog={(newLog) => setEvolutionLogs((prev) => [...prev, newLog])}
          />
        )}

        {/* CALENDAR PAGE */}
        {activeTab === 'calendar' && (
          <CalendarView history={history} />
        )}

        {/* HISTORY PAGE */}
        {activeTab === 'history' && (
          <HistoryView history={history} />
        )}

        {/* AI COACH CHAT */}
        {activeTab === 'chat' && profile && (
          <AICoachChat profile={profile} currentPlan={workoutPlan} />
        )}

        {/* PROFILE SETTINGS */}
        {activeTab === 'profile' && profile && (
          <ProfileView
            profile={profile}
            onUpdateProfile={setProfile}
            onRegeneratePlan={handleRegeneratePlan}
            onOpenSafety={() => setSafetyModalOpen(true)}
            loadingRegen={loadingPlan}
            themeMode={themeMode}
            onSelectTheme={setThemeMode}
          />
        )}
      </main>

      {/* BOTTOM MOBILE NAVIGATION */}
      {profile && activeTab !== 'landing' && activeTab !== 'questionnaire' && activeTab !== 'active-workout' && (
        <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />
      )}

      {/* NOTIFICATIONS MODAL */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        profile={profile}
        streakDays={computeStreakDays()}
        onNavigate={setActiveTab}
      />

      {/* SAFETY DISCLAIMER MODAL */}
      <SafetyDisclaimerModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />

      {/* REST TIMER MODAL */}
      <RestTimerModal
        isOpen={restTimerState.isOpen}
        initialSeconds={restTimerState.seconds}
        onClose={() => setRestTimerState({ ...restTimerState, isOpen: false })}
      />

      {/* SUBSTITUTE EXERCISE MODAL */}
      {profile && (
        <SubstituteModal
          isOpen={substituteModalState.isOpen}
          exercise={substituteModalState.exercise}
          profile={profile}
          onClose={() => setSubstituteModalState({ isOpen: false, exercise: null })}
          onSelectAlternative={handleSelectAlternative}
        />
      )}
    </div>
  );
}

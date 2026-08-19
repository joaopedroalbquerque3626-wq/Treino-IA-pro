import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan, CompletedSession, EvolutionLog, Exercise, WorkoutDay, ProgressionSuggestion, ThemeMode } from './types';
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
import { generateLocalWorkoutPlan } from './services/workoutEngine';
import { fetchAIPlanGeneration, fetchAIPlanTweak } from './services/aiApi';
import { loadPersistedAccount, savePersistedAccount } from './services/persistence';
import { sanitizeWorkoutPlan, sessionAlreadyRecorded, validEvolutionLog, progressionFromHistory } from './utils/dataGuards';

const initialAccount = loadPersistedAccount();

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try { const saved = localStorage.getItem('treino_ia_pro_theme'); return saved === 'light' || saved === 'dark' || saved === 'system' ? saved as ThemeMode : 'system'; } catch { return 'system'; }
  });
  const [profile, setProfile] = useState<UserProfile | null>(initialAccount.profile);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(initialAccount.workoutPlan);
  const [history, setHistory] = useState<CompletedSession[]>(initialAccount.history);
  const [evolutionLogs, setEvolutionLogs] = useState<EvolutionLog[]>(initialAccount.evolutionLogs);
  const [activeTab, setActiveTab] = useState<string>(() => initialAccount.profile && initialAccount.workoutPlan ? 'dashboard' : initialAccount.profile ? 'profile' : 'landing');
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [restTimerState, setRestTimerState] = useState({ isOpen: false, seconds: 60 });
  const [substituteModalState, setSubstituteModalState] = useState<{ isOpen: boolean; exercise: Exercise | null }>({ isOpen: false, exercise: null });
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<WorkoutDay | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('treino_ia_pro_theme', themeMode);
      const root = document.documentElement;
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = () => root.classList.toggle('dark', themeMode === 'dark' || (themeMode === 'system' && media.matches));
      apply();
      const listener = () => themeMode === 'system' && apply();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } catch { /* non-critical */ }
  }, [themeMode]);

  useEffect(() => {
    savePersistedAccount({ profile, workoutPlan, history, evolutionLogs });
  }, [profile, workoutPlan, history, evolutionLogs]);

  useEffect(() => {
    if (profile?.weight && evolutionLogs.length === 0) setEvolutionLogs([{ id: `evo_init_${Date.now()}`, date: new Date().toLocaleDateString('en-CA'), weightKg: profile.weight, notes: 'Medida inicial informada no perfil' }]);
  }, [profile, evolutionLogs.length]);

  const handleToggleTheme = () => setThemeMode((prev) => prev === 'light' ? 'dark' : prev === 'dark' ? 'light' : (document.documentElement.classList.contains('dark') ? 'light' : 'dark'));
  const computeStreakDays = () => {
    if (!history.length) return 0;
    const day = (v: string | Date) => { const d = new Date(v); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
    const dates = [...new Set(history.map(h => day(h.date)))].sort((a, b) => b - a);
    const today = day(new Date());
    if (dates[0] !== today && dates[0] !== today - 86400000) return 0;
    let streak = 1;
    for (let i = 1; i < dates.length && dates[i - 1] - dates[i] === 86400000; i++) streak++;
    return streak;
  };
  const computeProgressionSuggestions = (): ProgressionSuggestion[] => progressionFromHistory(history) as ProgressionSuggestion[];

  const createSafePlan = (plan: WorkoutPlan, userProfile: UserProfile) => sanitizeWorkoutPlan(plan, userProfile);
  const handleQuestionnaireComplete = async (userProfile: UserProfile) => {
    setProfile(userProfile); setLoadingPlan(true); setActiveTab('workouts');
    try { setWorkoutPlan(createSafePlan(await fetchAIPlanGeneration(userProfile), userProfile)); }
    catch (err) { console.error('API Plan Generation failed, using local fallback:', err); setWorkoutPlan(createSafePlan(generateLocalWorkoutPlan(userProfile), userProfile)); }
    finally { setLoadingPlan(false); setActiveTab('dashboard'); }
  };
  const handleLoginDemo = () => {
    if (profile && workoutPlan) return setActiveTab('dashboard');
    const demoProfile: UserProfile = { id: `usr_demo_${Date.now()}`, name: 'Lucas Silva', age: 28, height: 178, weight: 76, objective: 'Ganho de massa muscular', experience: 'Intermediário', location: 'Academia', equipment: ['Anilhas e Halteres', 'Máquinas de Academia', 'Barra Fixa', 'Banco Inclinável'], daysPerWeek: 4, sessionTimeMin: 55, preferredExercises: 'Supino reto, puxada frontal, agachamento livre', avoidExercises: '', observations: 'Foco em hipertrofia com boa progressão de cargas', healthSafety: { injuries: '', persistentPain: '', diseases: '', recentSurgeries: '', physicalLimitations: '', exerciseSymptoms: '', hasCondition: false, acceptedTerms: true }, createdAt: new Date().toISOString() };
    setProfile(demoProfile); setWorkoutPlan(createSafePlan(generateLocalWorkoutPlan(demoProfile), demoProfile)); setActiveTab('dashboard');
  };
  const handleRegeneratePlan = async () => {
    if (!profile) return; setLoadingPlan(true);
    try { setWorkoutPlan(createSafePlan(await fetchAIPlanGeneration(profile), profile)); setActiveTab('workouts'); }
    catch (err) { console.error('Regeneration failed:', err); setWorkoutPlan(createSafePlan(generateLocalWorkoutPlan(profile), profile)); setActiveTab('workouts'); }
    finally { setLoadingPlan(false); }
  };
  const handleCustomPlanTweak = async (promptText: string) => {
    if (!profile || !workoutPlan || !promptText.trim()) return; setLoadingPlan(true);
    try { setWorkoutPlan(createSafePlan(await fetchAIPlanTweak(workoutPlan, promptText.trim(), profile), profile)); }
    catch (err) { console.error('Plan tweak failed:', err); }
    finally { setLoadingPlan(false); }
  };
  const handleStartWorkout = (dayId: string) => { const day = workoutPlan?.days.find(d => d.id === dayId); if (day && !day.isRestDay && day.exercises.length) { setActiveWorkoutDay(day); setActiveTab('active-workout'); } };
  const handleFinishWorkout = (session: CompletedSession) => {
    setHistory(prev => sessionAlreadyRecorded(prev, session) ? prev : [...prev, session]);
    setActiveWorkoutDay(null); setActiveTab('dashboard');
  };
  const handleAddEvolution = (log: EvolutionLog) => {
    if (!validEvolutionLog(log)) return;
    setEvolutionLogs(prev => prev.some(item => item.id === log.id || item.date === log.date) ? prev : [...prev, log].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };
  const handleSelectAlternative = (oldExerciseId: string, newExercise: Exercise) => {
    if (!workoutPlan) return;
    const updatedDays = workoutPlan.days.map(day => ({ ...day, exercises: day.exercises.map(ex => ex.id === oldExerciseId ? newExercise : ex) }));
    const updated = { ...workoutPlan, days: updatedDays }; setWorkoutPlan(updated);
    if (activeWorkoutDay) { const day = updatedDays.find(d => d.id === activeWorkoutDay.id); if (day) setActiveWorkoutDay(day); }
  };

  return <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
    <Navbar profile={profile} activeTab={activeTab} onNavigate={setActiveTab} streakDays={computeStreakDays()} onOpenNotifications={() => setNotificationsOpen(true)} onOpenSafety={() => setSafetyModalOpen(true)} themeMode={themeMode} onToggleTheme={handleToggleTheme} onLoginDemo={handleLoginDemo} />
    <main className="flex-1 min-w-0 w-full overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
      {activeTab === 'landing' && <LandingPage onStartQuestionnaire={() => setActiveTab('questionnaire')} onLoginDemo={handleLoginDemo} onOpenSafety={() => setSafetyModalOpen(true)} />}
      {activeTab === 'questionnaire' && <QuestionnaireWizard onComplete={handleQuestionnaireComplete} onCancel={() => setActiveTab(profile ? (workoutPlan ? 'dashboard' : 'profile') : 'landing')} />}
      {activeTab === 'dashboard' && profile && <DashboardView profile={profile} workoutPlan={workoutPlan} history={history} streakDays={computeStreakDays()} onStartWorkout={handleStartWorkout} onNavigate={setActiveTab} onRegeneratePlan={handleRegeneratePlan} />}
      {activeTab === 'workouts' && profile && workoutPlan && <WorkoutPlanView plan={workoutPlan} profile={profile} onStartWorkout={handleStartWorkout} onOpenSubstituteModal={ex => setSubstituteModalState({ isOpen: true, exercise: ex })} onCustomPlanPrompt={handleCustomPlanTweak} loadingRegen={loadingPlan} />}
      {activeTab === 'active-workout' && profile && activeWorkoutDay && <ActiveWorkoutMode workoutDay={activeWorkoutDay} profile={profile} onFinishWorkout={handleFinishWorkout} onCancelWorkout={() => setActiveTab('dashboard')} onOpenRestTimer={seconds => setRestTimerState({ isOpen: true, seconds })} onOpenSubstituteModal={ex => setSubstituteModalState({ isOpen: true, exercise: ex })} />}
      {activeTab === 'evolution' && profile && <EvolutionView profile={profile} evolutionLogs={evolutionLogs} history={history} onAddEvolutionLog={handleAddEvolution} />}
      {activeTab === 'calendar' && <CalendarView history={history} />}
      {activeTab === 'history' && <HistoryView history={history} />}
      {activeTab === 'profile' && profile && <ProfileView profile={profile} onUpdateProfile={setProfile} onRegeneratePlan={handleRegeneratePlan} />}
    </main>
    {profile && <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />}
    <SafetyDisclaimerModal isOpen={safetyModalOpen} onClose={() => setSafetyModalOpen(false)} />
    <NotificationsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    <RestTimerModal isOpen={restTimerState.isOpen} seconds={restTimerState.seconds} onClose={() => setRestTimerState(s => ({ ...s, isOpen: false }))} />
    <SubstituteModal isOpen={substituteModalState.isOpen} exercise={substituteModalState.exercise} profile={profile} onClose={() => setSubstituteModalState({ isOpen: false, exercise: null })} onSelectAlternative={handleSelectAlternative} />
  </div>;
}

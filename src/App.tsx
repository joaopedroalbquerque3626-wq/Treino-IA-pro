import React, { useEffect, useState } from 'react';
import { UserProfile, WorkoutPlan, CompletedSession, EvolutionLog, Exercise, WorkoutDay, ThemeMode } from './types';
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
import { sanitizeWorkoutPlan, sessionAlreadyRecorded, validEvolutionLog } from './utils/dataGuards';

const initialAccount = loadPersistedAccount();

type AppMessage = { type: 'info' | 'success' | 'warning' | 'error'; text: string } | null;

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('treino_ia_pro_theme');
      return saved === 'light' || saved === 'dark' || saved === 'system' ? saved as ThemeMode : 'system';
    } catch {
      return 'system';
    }
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
  const [appMessage, setAppMessage] = useState<AppMessage>(null);

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
    } catch {
      // Theme persistence is non-critical.
    }
  }, [themeMode]);

  useEffect(() => {
    const saved = savePersistedAccount({ profile, workoutPlan, history, evolutionLogs });
    if (!saved && (profile || workoutPlan || history.length || evolutionLogs.length)) {
      setAppMessage({ type: 'warning', text: 'Não foi possível salvar os dados neste navegador. Verifique o espaço ou as permissões de armazenamento.' });
    }
  }, [profile, workoutPlan, history, evolutionLogs]);

  useEffect(() => {
    if (!appMessage) return;
    const timer = window.setTimeout(() => setAppMessage(null), 7000);
    return () => window.clearTimeout(timer);
  }, [appMessage]);

  useEffect(() => {
    if (profile?.weight && evolutionLogs.length === 0) {
      setEvolutionLogs([{ id: `evo_init_${Date.now()}`, date: new Date().toLocaleDateString('en-CA'), weightKg: profile.weight, notes: 'Medida inicial informada no perfil' }]);
    }
  }, [profile, evolutionLogs.length]);

  const safeNavigate = (tab: string) => {
    if (!profile && !['landing', 'questionnaire'].includes(tab)) {
      setActiveTab('landing');
      return;
    }
    if (tab === 'workouts' && !workoutPlan) {
      setAppMessage({ type: 'info', text: 'Gere seu plano de treino antes de abrir a área de treinos.' });
      setActiveTab('profile');
      return;
    }
    if (tab === 'dashboard' && !workoutPlan) {
      setActiveTab('profile');
      return;
    }
    setActiveTab(tab);
  };

  const handleToggleTheme = () => setThemeMode((prev) => {
    if (prev === 'light') return 'dark';
    if (prev === 'dark') return 'light';
    return document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  });

  const computeStreakDays = () => {
    if (!history.length) return 0;
    const day = (value: string | Date) => {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    };
    const dates = [...new Set(history.map((item) => day(item.date)))].sort((a, b) => b - a);
    const today = day(new Date());
    if (dates[0] !== today && dates[0] !== today - 86400000) return 0;
    let streak = 1;
    for (let index = 1; index < dates.length && dates[index - 1] - dates[index] === 86400000; index += 1) streak += 1;
    return streak;
  };

  const createSafePlan = (plan: WorkoutPlan, userProfile: UserProfile) => sanitizeWorkoutPlan(plan, userProfile);

  const handleQuestionnaireComplete = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setLoadingPlan(true);
    setActiveTab('workouts');
    setAppMessage({ type: 'info', text: 'Gerando seu plano personalizado…' });
    try {
      const plan = createSafePlan(await fetchAIPlanGeneration(userProfile), userProfile);
      setWorkoutPlan(plan);
      setAppMessage({ type: 'success', text: 'Plano personalizado gerado com sucesso.' });
    } catch (error) {
      console.error('API Plan Generation failed, using local fallback:', error);
      setWorkoutPlan(createSafePlan(generateLocalWorkoutPlan(userProfile), userProfile));
      setAppMessage({ type: 'warning', text: 'A IA ficou indisponível. Geramos um plano local seguro para você continuar.' });
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
      observations: 'Perfil demonstrativo do TREINO IA PRO',
      healthSafety: { injuries: '', persistentPain: '', diseases: '', recentSurgeries: '', physicalLimitations: '', exerciseSymptoms: '', hasCondition: false, acceptedTerms: true },
      createdAt: new Date().toISOString(),
    };
    setProfile(demoProfile);
    setWorkoutPlan(createSafePlan(generateLocalWorkoutPlan(demoProfile), demoProfile));
    setAppMessage({ type: 'info', text: 'Você está usando um perfil demonstrativo salvo apenas neste dispositivo.' });
    setActiveTab('dashboard');
  };

  const handleRegeneratePlan = async () => {
    if (!profile || loadingPlan) return;
    setLoadingPlan(true);
    setAppMessage({ type: 'info', text: 'Atualizando seu plano…' });
    try {
      setWorkoutPlan(createSafePlan(await fetchAIPlanGeneration(profile), profile));
      setAppMessage({ type: 'success', text: 'Plano atualizado com sucesso.' });
    } catch (error) {
      console.error('Regeneration failed:', error);
      setWorkoutPlan(createSafePlan(generateLocalWorkoutPlan(profile), profile));
      setAppMessage({ type: 'warning', text: 'A IA ficou indisponível. O plano foi atualizado usando o motor local.' });
    } finally {
      setLoadingPlan(false);
      setActiveTab('workouts');
    }
  };

  const handleCustomPlanTweak = async (promptText: string) => {
    if (!profile || !workoutPlan || !promptText.trim() || loadingPlan) return;
    setLoadingPlan(true);
    setAppMessage({ type: 'info', text: 'Aplicando o ajuste ao seu plano…' });
    try {
      setWorkoutPlan(createSafePlan(await fetchAIPlanTweak(workoutPlan, promptText.trim(), profile), profile));
      setAppMessage({ type: 'success', text: 'Ajuste aplicado ao plano.' });
    } catch (error) {
      console.error('Plan tweak failed:', error);
      setAppMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível ajustar o plano agora.' });
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleStartWorkout = (dayId: string) => {
    const day = workoutPlan?.days.find((item) => item.id === dayId);
    if (!day || day.isRestDay || !day.exercises.length) {
      setAppMessage({ type: 'error', text: 'Este treino não está disponível. Gere ou revise seu plano.' });
      return;
    }
    setActiveWorkoutDay(day);
    setActiveTab('active-workout');
  };

  const handleFinishWorkout = (session: CompletedSession) => {
    setHistory((previous) => sessionAlreadyRecorded(previous, session) ? previous : [...previous, session]);
    setActiveWorkoutDay(null);
    setAppMessage({ type: 'success', text: 'Treino salvo no histórico.' });
    setActiveTab('dashboard');
  };

  const handleAddEvolution = (log: EvolutionLog) => {
    if (!validEvolutionLog(log)) {
      setAppMessage({ type: 'error', text: 'Confira os dados de evolução antes de salvar.' });
      return;
    }
    setEvolutionLogs((previous) => previous.some((item) => item.id === log.id || item.date === log.date)
      ? previous
      : [...previous, log].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setAppMessage({ type: 'success', text: 'Evolução registrada.' });
  };

  const handleSelectAlternative = (oldExerciseId: string, newExercise: Exercise) => {
    if (!workoutPlan) return;
    const updatedDays = workoutPlan.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => exercise.id === oldExerciseId ? newExercise : exercise),
    }));
    const updated = { ...workoutPlan, days: updatedDays };
    setWorkoutPlan(updated);
    if (activeWorkoutDay) {
      const day = updatedDays.find((item) => item.id === activeWorkoutDay.id);
      if (day) setActiveWorkoutDay(day);
    }
    setAppMessage({ type: 'success', text: 'Exercício substituído no plano.' });
  };

  const messageStyles = appMessage?.type === 'error'
    ? 'bg-red-600 text-white'
    : appMessage?.type === 'warning'
      ? 'bg-amber-500 text-slate-950'
      : appMessage?.type === 'success'
        ? 'bg-emerald-600 text-white'
        : 'bg-blue-600 text-white';

  return (
    <div className="min-h-screen min-h-[100dvh] overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <a href="#main-content" className="sr-only-focusable">Pular para o conteúdo principal</a>
      <Navbar profile={profile} activeTab={activeTab} onNavigate={safeNavigate} streakDays={computeStreakDays()} onOpenNotifications={() => setNotificationsOpen(true)} onOpenSafety={() => setSafetyModalOpen(true)} themeMode={themeMode} onToggleTheme={handleToggleTheme} onLoginDemo={handleLoginDemo} />

      {appMessage && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${messageStyles}`} role={appMessage.type === 'error' ? 'alert' : 'status'} aria-live={appMessage.type === 'error' ? 'assertive' : 'polite'}>
          <div className="flex items-start justify-between gap-3">
            <span>{appMessage.text}</span>
            <button type="button" onClick={() => setAppMessage(null)} aria-label="Fechar mensagem" className="shrink-0 rounded-lg px-1.5 hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-white">×</button>
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 w-full overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
        {activeTab === 'landing' && <LandingPage onStartQuestionnaire={() => setActiveTab('questionnaire')} onLoginDemo={handleLoginDemo} onOpenSafety={() => setSafetyModalOpen(true)} />}
        {activeTab === 'questionnaire' && <QuestionnaireWizard onComplete={handleQuestionnaireComplete} onCancel={() => setActiveTab(profile ? (workoutPlan ? 'dashboard' : 'profile') : 'landing')} />}
        {activeTab === 'dashboard' && profile && <DashboardView profile={profile} workoutPlan={workoutPlan} history={history} streakDays={computeStreakDays()} onStartWorkout={handleStartWorkout} onNavigate={safeNavigate} onRegeneratePlan={handleRegeneratePlan} />}
        {activeTab === 'workouts' && profile && workoutPlan && <WorkoutPlanView plan={workoutPlan} profile={profile} onStartWorkout={handleStartWorkout} onOpenSubstituteModal={(exercise) => setSubstituteModalState({ isOpen: true, exercise })} onCustomPlanPrompt={handleCustomPlanTweak} loadingRegen={loadingPlan} />}
        {activeTab === 'active-workout' && profile && activeWorkoutDay && <ActiveWorkoutMode workoutDay={activeWorkoutDay} profile={profile} onFinishWorkout={handleFinishWorkout} onCancelWorkout={() => setActiveTab('dashboard')} onOpenRestTimer={(seconds) => setRestTimerState({ isOpen: true, seconds })} onOpenSubstituteModal={(exercise) => setSubstituteModalState({ isOpen: true, exercise })} />}
        {activeTab === 'evolution' && profile && <EvolutionView profile={profile} evolutionLogs={evolutionLogs} history={history} onAddEvolutionLog={handleAddEvolution} />}
        {activeTab === 'calendar' && <CalendarView history={history} />}
        {activeTab === 'history' && <HistoryView history={history} />}
        {activeTab === 'profile' && profile && <ProfileView profile={profile} onUpdateProfile={setProfile} onRegeneratePlan={handleRegeneratePlan} onOpenSafety={() => setSafetyModalOpen(true)} loadingRegen={loadingPlan} themeMode={themeMode} onSelectTheme={setThemeMode} />}
      </main>

      {profile && <BottomNav activeTab={activeTab} onNavigate={safeNavigate} />}
      <SafetyDisclaimerModal isOpen={safetyModalOpen} onClose={() => setSafetyModalOpen(false)} />
      <NotificationsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <RestTimerModal isOpen={restTimerState.isOpen} seconds={restTimerState.seconds} onClose={() => setRestTimerState((state) => ({ ...state, isOpen: false }))} />
      <SubstituteModal isOpen={substituteModalState.isOpen} exercise={substituteModalState.exercise} profile={profile} onClose={() => setSubstituteModalState({ isOpen: false, exercise: null })} onSelectAlternative={handleSelectAlternative} />
    </div>
  );
}

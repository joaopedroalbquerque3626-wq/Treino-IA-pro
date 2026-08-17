import React, { useState } from 'react';
import { User, Bell, RefreshCw, Save, ShieldAlert, Check, Sun, Moon, Laptop } from 'lucide-react';
import { UserProfile, Objective, ExperienceLevel, WorkoutLocation, NotificationSettings, ThemeMode } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onRegeneratePlan: () => void;
  onOpenSafety: () => void;
  loadingRegen?: boolean;
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onRegeneratePlan,
  onOpenSafety,
  loadingRegen = false,
  themeMode,
  onSelectTheme,
}) => {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);

  const [objective, setObjective] = useState<Objective>(profile.objective);
  const [experience, setExperience] = useState<ExperienceLevel>(profile.experience);
  const [location, setLocation] = useState<WorkoutLocation>(profile.location);

  const [equipment, setEquipment] = useState<string[]>(profile.equipment || []);
  const [daysPerWeek, setDaysPerWeek] = useState(profile.daysPerWeek);
  const [sessionTimeMin, setSessionTimeMin] = useState(profile.sessionTimeMin);

  const [preferredExercises, setPreferredExercises] = useState(profile.preferredExercises || '');
  const [avoidExercises, setAvoidExercises] = useState(profile.avoidExercises || '');
  const [observations, setObservations] = useState(profile.observations || '');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationSettings>({
    workoutReminders: true,
    missedWorkoutAlerts: true,
    evolutionLogReminders: true,
    weeklySummary: true,
    reminderTime: '08:00',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableEquipmentOptions = [
    'Anilhas e Halteres',
    'Barra Fixa',
    'Elásticos/Extensores',
    'Máquinas de Academia',
    'Banco Inclinável',
    'Peso Corporal',
  ];

  const handleToggleEquipment = (eq: string) => {
    if (equipment.includes(eq)) {
      setEquipment(equipment.filter((e) => e !== eq));
    } else {
      setEquipment([...equipment, eq]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      objective,
      experience,
      location,
      equipment,
      daysPerWeek: Number(daysPerWeek),
      sessionTimeMin: Number(sessionTimeMin),
      preferredExercises,
      avoidExercises,
      observations,
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-in fade-in pb-28">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 border border-blue-500 flex items-center justify-center text-xl font-black text-white shadow-md shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{name}</h1>
            <p className="text-xs text-blue-400 font-semibold">{objective} • {experience}</p>
          </div>
        </div>

        <button
          onClick={onRegeneratePlan}
          disabled={loadingRegen}
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loadingRegen ? 'animate-spin' : ''}`} />
          <span>RECALCULAR PLANO COM IA</span>
        </button>
      </div>

      {/* APARÊNCIA & TEMA (Dark / Light / System) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Aparência do Aplicativo</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Escolha entre o Modo Escuro, Modo Claro ou sincronizado com o sistema.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => onSelectTheme('dark')}
            className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 select-none ${
              themeMode === 'dark'
                ? 'bg-slate-900 text-white border-blue-500 ring-2 ring-blue-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold">Escuro</span>
            {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-blue-400 font-bold" />}
          </button>

          {/* Light Mode */}
          <button
            type="button"
            onClick={() => onSelectTheme('light')}
            className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 select-none ${
              themeMode === 'light'
                ? 'bg-blue-50 text-blue-900 border-blue-500 ring-2 ring-blue-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">Claro</span>
            {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
          </button>

          {/* System Mode */}
          <button
            type="button"
            onClick={() => onSelectTheme('system')}
            className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 select-none ${
              themeMode === 'system'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-500 ring-2 ring-blue-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-bold">Sistema</span>
            {themeMode === 'system' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 font-bold" />}
          </button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-5 sm:space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs transition-colors">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Dados Corporais e Identificação</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Idade</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Goal & Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs transition-colors">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Objetivo e Treinamento
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Objetivo Principal</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as Objective)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              >
                <option value="Ganho de massa muscular">Ganho de massa muscular (Hipertrofia)</option>
                <option value="Perda de gordura">Perda de gordura (Definição)</option>
                <option value="Ganho de força">Ganho de força</option>
                <option value="Condicionamento físico">Condicionamento físico geral</option>
                <option value="Manutenção">Manutenção</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nível</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Local</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as WorkoutLocation)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Academia">Academia</option>
                  <option value="Casa">Casa</option>
                  <option value="Ao ar livre">Ao ar livre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dias por semana</label>
                <input
                  type="number"
                  min={2}
                  max={7}
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tempo sessão (min)</label>
                <input
                  type="number"
                  min={20}
                  max={120}
                  value={sessionTimeMin}
                  onChange={(e) => setSessionTimeMin(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Equipment toggles */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Equipamentos disponíveis:</label>
              <div className="grid grid-cols-2 gap-2">
                {availableEquipmentOptions.map((eq) => {
                  const isSelected = equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => handleToggleEquipment(eq)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-slate-900 dark:text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{eq}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 font-bold shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Health Disclaimer & Button */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-amber-900 dark:text-amber-300">Diretrizes de Saúde e Segurança</p>
              <p className="text-slate-600 dark:text-slate-400">Verifique nossos termos de responsabilidade e prevenção de lesões.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSafety}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-950 cursor-pointer shrink-0 transition-colors shadow-2xs active:scale-95"
          >
            Abrir Termo de Saúde
          </button>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full min-h-[50px] py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'PERFIL SALVO COM SUCESSO!' : 'SALVAR ALTERAÇÕES'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

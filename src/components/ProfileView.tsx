import React, { useState } from 'react';
import { User, Bell, RefreshCw, Save, ShieldAlert, Check } from 'lucide-react';
import { UserProfile, Objective, ExperienceLevel, WorkoutLocation, NotificationSettings } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onRegeneratePlan: () => void;
  onOpenSafety: () => void;
  loadingRegen?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onRegeneratePlan,
  onOpenSafety,
  loadingRegen = false,
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in pb-28">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 border border-blue-500 flex items-center justify-center text-xl font-black text-white shadow-md">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{name}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {objective} • {experience} • {daysPerWeek}x por semana
            </p>
          </div>
        </div>

        {/* REGENERAR MEU PLANO CTA */}
        <button
          onClick={onRegeneratePlan}
          disabled={loadingRegen}
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loadingRegen ? 'animate-spin' : ''}`} />
          <span>{loadingRegen ? 'GERANDO...' : 'REGENERAR MEU PLANO COM IA'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 text-blue-600" />
          <span>Perfil atualizado com sucesso! Para aplicar as mudanças no seu treino, clique em "Regenerar Meu Plano".</span>
        </div>
      )}

      {/* FORM: Profile Editing */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Informações Pessoais & Objetivos</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Idade</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Altura (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Objetivo principal</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as Objective)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900"
              >
                <option value="Ganho de massa muscular">Ganho de massa muscular</option>
                <option value="Perda de gordura">Perda de gordura</option>
                <option value="Ganho de força">Ganho de força</option>
                <option value="Condicionamento físico">Condicionamento físico</option>
                <option value="Manutenção">Manutenção</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nível de experiência</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900"
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Local de treino</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as WorkoutLocation)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900"
              >
                <option value="Academia">Academia</option>
                <option value="Casa">Casa</option>
                <option value="Ao ar livre">Ao ar livre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Equipamentos disponíveis:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableEquipmentOptions.map((eq) => {
                const isChecked = equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => handleToggleEquipment(eq)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{eq}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dias por semana ({daysPerWeek})</label>
              <input
                type="range"
                min={2}
                max={7}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tempo por sessão ({sessionTimeMin} min)</label>
              <input
                type="range"
                min={20}
                max={120}
                step={5}
                value={sessionTimeMin}
                onChange={(e) => setSessionTimeMin(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exercícios que você prefere</label>
              <input
                type="text"
                value={preferredExercises}
                onChange={(e) => setPreferredExercises(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exercícios a evitar</label>
              <input
                type="text"
                value={avoidExercises}
                onChange={(e) => setAvoidExercises(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <Save className="w-4 h-4 text-blue-400" />
              <span>Salvar Alterações de Perfil</span>
            </button>
          </div>
        </div>
      </form>

      {/* NOTIFICATIONS SETTINGS PANEL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <span>Configuração de Notificações & Lembretes</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-900">Lembrete de Treino do Dia</p>
              <p className="text-[10px] text-slate-500">Notificação no horário programado para realizar o treino.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.workoutReminders}
              onChange={(e) => setNotifications({ ...notifications, workoutReminders: e.target.checked })}
              className="accent-blue-600 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-900">Aviso de Treino Perdido</p>
              <p className="text-[10px] text-slate-500">Lembrete amigável caso não registre o treino do dia.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.missedWorkoutAlerts}
              onChange={(e) => setNotifications({ ...notifications, missedWorkoutAlerts: e.target.checked })}
              className="accent-blue-600 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-900">Lembrete de Evolução de Medidas</p>
              <p className="text-[10px] text-slate-500">Notificação semanal para registrar seu peso e fotos.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.evolutionLogReminders}
              onChange={(e) => setNotifications({ ...notifications, evolutionLogReminders: e.target.checked })}
              className="accent-blue-600 w-4 h-4"
            />
          </div>
        </div>
      </div>

      {/* HEALTH & SAFETY MODAL LINK */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Termos de Saúde & Isenção de Responsabilidade</h4>
          <p className="text-[10px] text-slate-500">Revise as diretrizes de segurança física do aplicativo.</p>
        </div>
        <button
          onClick={onOpenSafety}
          className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-amber-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Ver Termos</span>
        </button>
      </div>
    </div>
  );
};


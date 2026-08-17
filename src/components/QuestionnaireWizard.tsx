import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Dumbbell, ShieldAlert, Sparkles } from 'lucide-react';
import { UserProfile, Objective, ExperienceLevel, WorkoutLocation } from '../types';

interface QuestionnaireWizardProps {
  onComplete: (profile: UserProfile) => void;
  onCancel: () => void;
}

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | string>(25);
  const [height, setHeight] = useState<number | string>(175);
  const [weight, setWeight] = useState<number | string>(70);

  const [objective, setObjective] = useState<Objective>('Ganho de massa muscular');
  const [experience, setExperience] = useState<ExperienceLevel>('Iniciante');
  const [location, setLocation] = useState<WorkoutLocation>('Academia');

  const [equipmentList, setEquipmentList] = useState<string[]>([
    'Anilhas e Halteres',
    'Barra Fixa',
    'Máquinas de Academia',
  ]);

  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [sessionTimeMin, setSessionTimeMin] = useState<number>(50);

  const [preferredExercises, setPreferredExercises] = useState('');
  const [avoidExercises, setAvoidExercises] = useState('');
  const [observations, setObservations] = useState('');

  // Health & Safety State
  const [hasCondition, setHasCondition] = useState(false);
  const [injuries, setInjuries] = useState('');
  const [persistentPain, setPersistentPain] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const availableEquipmentOptions = [
    'Anilhas e Halteres',
    'Barra Fixa',
    'Elásticos/Extensores',
    'Máquinas de Academia',
    'Banco Inclinável',
    'Peso Corporal',
  ];

  const handleToggleEquipment = (eq: string) => {
    if (equipmentList.includes(eq)) {
      setEquipmentList(equipmentList.filter((e) => e !== eq));
    } else {
      setEquipmentList([...equipmentList, eq]);
    }
  };

  const handleFinish = () => {
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Atleta',
      age: Number(age) || 25,
      height: Number(height) || 175,
      weight: Number(weight) || 70,
      objective,
      experience,
      location,
      equipment: equipmentList.length > 0 ? equipmentList : ['Peso Corporal'],
      daysPerWeek: Number(daysPerWeek) || 4,
      sessionTimeMin: Number(sessionTimeMin) || 50,
      preferredExercises,
      avoidExercises,
      observations,
      healthSafety: {
        injuries,
        persistentPain,
        diseases: '',
        recentSurgeries: '',
        physicalLimitations: observations,
        exerciseSymptoms: '',
        hasCondition,
        acceptedTerms,
      },
      createdAt: new Date().toISOString(),
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-3 sm:px-6 pb-24 transition-colors">
      <div className="max-w-xl mx-auto w-full">
        {/* Header Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <button
              onClick={step > 1 ? () => setStep(step - 1) : onCancel}
              className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{step === 1 ? 'Sair' : 'Anterior'}</span>
            </button>
            <span className="font-bold">Passo {step} de {totalSteps}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Personal Identification */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                1. Identificação
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">Dados Pessoais</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Para dimensionar seu volume ideal e metabolismo.</p>
            </div>

            <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs transition-colors">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Como devemos te chamar?</label>
                <input
                  type="text"
                  placeholder="Seu nome ou apelido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Idade</label>
                  <input
                    type="number"
                    min={12}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-xs text-slate-900 dark:text-white text-center font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={230}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-xs text-slate-900 dark:text-white text-center font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    min={30}
                    max={250}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-xs text-slate-900 dark:text-white text-center font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Main Objective & Experience */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                2. Foco e Experiência
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">Qual o seu objetivo principal?</h2>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  'Ganho de massa muscular',
                  'Perda de gordura',
                  'Ganho de força',
                  'Condicionamento físico',
                  'Manutenção',
                ] as Objective[]
              ).map((obj) => (
                <button
                  key={obj}
                  type="button"
                  onClick={() => setObjective(obj)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-95 ${
                    objective === obj
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-semibold">{obj}</span>
                  {objective === obj && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Nível de experiência:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Iniciante', 'Intermediário', 'Avançado'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperience(lvl)}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                      experience === lvl
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Location & Equipment */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                3. Estrutura
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">Onde e com o que vai treinar?</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Local do treino:</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(['Academia', 'Casa', 'Ao ar livre'] as WorkoutLocation[]).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                      location === loc
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Equipamentos disponíveis:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableEquipmentOptions.map((eq) => {
                  const isSelected = equipmentList.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => handleToggleEquipment(eq)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-slate-900 dark:text-white font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Dumbbell className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                        <span>{eq}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 font-bold" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Frequency & Duration */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                4. Disponibilidade
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">Sua rotina semanal</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-6 shadow-xs transition-colors">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dias disponíveis por semana:</label>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-700">
                    {daysPerWeek} dias
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={7}
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  <span>2 dias</span>
                  <span>4 dias</span>
                  <span>7 dias</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tempo por treino (sessão):</label>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-700">
                    {sessionTimeMin} min
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={120}
                  step={5}
                  value={sessionTimeMin}
                  onChange={(e) => setSessionTimeMin(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  <span>20 min (Rápido)</span>
                  <span>50 min (Padrão)</span>
                  <span>120 min (Longo)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Specific Preferences & Avoid List */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                5. Preferências
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">Exercícios e Gostos</h2>
            </div>

            <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs transition-colors">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Exercícios que você prefere:</label>
                <input
                  type="text"
                  placeholder="Ex: Supino reto, puxada frontal, leg press..."
                  value={preferredExercises}
                  onChange={(e) => setPreferredExercises(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Exercícios que deseja EVITAR:</label>
                <input
                  type="text"
                  placeholder="Ex: Agachamento livre, barra fixa..."
                  value={avoidExercises}
                  onChange={(e) => setAvoidExercises(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Outras observações importantes:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Prefiro focar em braços..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Health Safety Screening */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700">
                6. Segurança & Saúde
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">Checkup Preventivo</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs transition-colors">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
                  Sua integridade física é nossa prioridade. Informe se possui alguma restrição médica antes do plano ser montado.
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Possui alguma lesão recente, dor persistente ou recomendação médica?
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasCondition(false)}
                    className={`flex-1 py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      !hasCondition
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Não, estou apto(a)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasCondition(true)}
                    className={`flex-1 py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      hasCondition
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Sim, tenho restrições
                  </button>
                </div>

                {hasCondition && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Descreva as lesões ou dores articulares:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Dor no ombro esquerdo, hérnia de disco..."
                      value={injuries}
                      onChange={(e) => setInjuries(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Compreendo que este aplicativo é uma ferramenta educativa e que devo consultar um profissional de saúde qualificado.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold cursor-pointer py-1"
          >
            Cancelar
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="min-h-[48px] px-6 sm:px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>CRIAR MEU PLANO COM IA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Plus,
  TrendingUp,
  Dumbbell,
  Award,
  Scale,
  Ruler,
  Flame,
  Activity,
  CheckCircle2,
  Calendar,
  X,
  Target,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { CompletedSession, EvolutionLog, UserProfile } from '../types';
import {
  calculateGhostLoadAdjustments,
  calculateGhostDefinitionAdjustments,
} from '../services/workoutEngine';

interface EvolutionViewProps {
  profile: UserProfile;
  history: CompletedSession[];
  evolutionLogs: EvolutionLog[];
  onAddEvolutionLog: (log: EvolutionLog) => void;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  profile,
  history,
  evolutionLogs,
  onAddEvolutionLog,
}) => {
  // TWO EVOLUTION MODES / TABS: 'loads' (Peso e Cargas) vs 'definition' (Definição Corporal e Medidas)
  const [activeEvolutionTab, setActiveEvolutionTab] = useState<'loads' | 'definition'>('loads');

  // MODAL STATES
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showDefinitionModal, setShowDefinitionModal] = useState(false);

  // GHOST AI AUTOMATIC RE-ADJUSTMENT CALCULATIONS FOR CHARTS
  const loadAdjustments = useMemo(
    () => calculateGhostLoadAdjustments(profile, evolutionLogs, history),
    [profile, evolutionLogs, history]
  );

  const defAdjustments = useMemo(
    () => calculateGhostDefinitionAdjustments(profile, evolutionLogs),
    [profile, evolutionLogs]
  );

  // LOAD & WEIGHT FORM STATES (string-friendly to allow complete erasing to 0 and empty)
  const lastLog = evolutionLogs[evolutionLogs.length - 1];
  const [weightKg, setWeightKg] = useState<string | number>(lastLog?.weightKg || profile.weight || 70);
  const [benchPressKg, setBenchPressKg] = useState<string | number>(lastLog?.benchPressKg || 60);
  const [squatKg, setSquatKg] = useState<string | number>(lastLog?.squatKg || 80);
  const [deadliftKg, setDeadliftKg] = useState<string | number>(lastLog?.deadliftKg || 90);
  const [overheadPressKg, setOverheadPressKg] = useState<string | number>(lastLog?.overheadPressKg || 40);
  const [loadNotes, setLoadNotes] = useState('');

  // DEFINITION & MEASUREMENTS FORM STATES (string-friendly to allow complete erasing)
  const [defWeightKg, setDefWeightKg] = useState<string | number>(lastLog?.weightKg || profile.weight || 70);
  const [definitionLevel, setDefinitionLevel] = useState<string>(lastLog?.definitionLevel || 'Moderada');
  const [bodyFatPercent, setBodyFatPercent] = useState<string | number>(lastLog?.bodyFatPercent || '');
  const [waistCm, setWaistCm] = useState<string | number>(lastLog?.waistCm || 82);
  const [armsCm, setArmsCm] = useState<string | number>(lastLog?.armsCm || 36);
  const [chestCm, setChestCm] = useState<string | number>(lastLog?.chestCm || 98);
  const [thighsCm, setThighsCm] = useState<string | number>(lastLog?.thighsCm || 56);
  const [hipsCm, setHipsCm] = useState<string | number>(lastLog?.hipsCm || 96);
  const [definitionNotes, setDefinitionNotes] = useState('');

  // SAVE LOAD & WEIGHT LOG
  const handleSaveLoadLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: EvolutionLog = {
      id: `evo_load_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: weightKg === '' ? profile.weight : Number(weightKg),
      benchPressKg: benchPressKg === '' ? undefined : Number(benchPressKg),
      squatKg: squatKg === '' ? undefined : Number(squatKg),
      deadliftKg: deadliftKg === '' ? undefined : Number(deadliftKg),
      overheadPressKg: overheadPressKg === '' ? undefined : Number(overheadPressKg),
      // Preserve previous measurements if available
      chestCm: lastLog?.chestCm,
      armsCm: lastLog?.armsCm,
      waistCm: lastLog?.waistCm,
      thighsCm: lastLog?.thighsCm,
      hipsCm: lastLog?.hipsCm,
      definitionLevel: lastLog?.definitionLevel,
      bodyFatPercent: lastLog?.bodyFatPercent,
      notes: loadNotes.trim() || undefined,
    };
    onAddEvolutionLog(newLog);
    setLoadNotes('');
    setShowLoadModal(false);
  };

  // SAVE BODY DEFINITION & MEASUREMENTS LOG
  const handleSaveDefinitionLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: EvolutionLog = {
      id: `evo_def_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: defWeightKg === '' ? profile.weight : Number(defWeightKg),
      definitionLevel,
      bodyFatPercent: bodyFatPercent === '' ? undefined : Number(bodyFatPercent),
      waistCm: waistCm === '' ? undefined : Number(waistCm),
      armsCm: armsCm === '' ? undefined : Number(armsCm),
      chestCm: chestCm === '' ? undefined : Number(chestCm),
      thighsCm: thighsCm === '' ? undefined : Number(thighsCm),
      hipsCm: hipsCm === '' ? undefined : Number(hipsCm),
      // Preserve previous loads if available
      benchPressKg: lastLog?.benchPressKg,
      squatKg: lastLog?.squatKg,
      deadliftKg: lastLog?.deadliftKg,
      overheadPressKg: lastLog?.overheadPressKg,
      notes: definitionNotes.trim() || undefined,
    };
    onAddEvolutionLog(newLog);
    setDefinitionNotes('');
    setShowDefinitionModal(false);
  };

  const latestLoadLog = evolutionLogs.slice().reverse().find((l) => l.benchPressKg || l.squatKg || l.deadliftKg) || lastLog;
  const latestDefLog = evolutionLogs.slice().reverse().find((l) => l.waistCm || l.armsCm || l.definitionLevel) || lastLog;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-in fade-in pb-28">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700 inline-block">
            MÉTRICAS & PROGRESSO
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 sm:mt-2">
            Evolução Física
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dois registros separados: controle suas cargas de treino e a definição das medidas corporais com reajuste de metas.
          </p>
        </div>

        {/* Action button corresponding to active mode */}
        {activeEvolutionTab === 'loads' ? (
          <button
            onClick={() => setShowLoadModal(true)}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>REGISTRAR PESO & CARGAS</span>
          </button>
        ) : (
          <button
            onClick={() => setShowDefinitionModal(true)}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>REGISTRAR MEDIDAS & DEFINIÇÃO</span>
          </button>
        )}
      </div>

      {/* DUAL EVOLUTION SELECTOR TABS */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-200/70 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 rounded-2xl gap-1">
        <button
          onClick={() => setActiveEvolutionTab('loads')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeEvolutionTab === 'loads'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>1. Peso & Cargas</span>
        </button>

        <button
          onClick={() => setActiveEvolutionTab('definition')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeEvolutionTab === 'definition'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>2. Definição do Corpo</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: PESO E CARGAS DE TREINO */}
      {/* ========================================================================= */}
      {activeEvolutionTab === 'loads' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Peso Atual</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {latestLoadLog?.weightKg || profile.weight} kg
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Meta: {profile.objective}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Supino Reto</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">
                {latestLoadLog?.benchPressKg || 60} kg
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Carga atual</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Agachamento</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
                {latestLoadLog?.squatKg || 80} kg
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Carga atual</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Levant. Terra</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1.5">
                {latestLoadLog?.deadliftKg || 90} kg
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Carga atual</p>
            </div>
          </div>

          {/* Load Progression Chart with Auto-Realigned Target Projections */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Gráfico de Cargas & Curva de Reajuste (kg)</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  As linhas tracejadas mostram os reajustes automáticos de sobrecarga progressiva calculados para seu perfil.
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              {loadAdjustments.chartDataWithProjections.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={loadAdjustments.chartDataWithProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 5', 'dataMax + 10']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" name="Peso Corporal" dataKey="peso" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" name="Supino" dataKey="supino" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" name="Agachamento" dataKey="agachamento" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" name="Terra" dataKey="terra" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" name="Meta Supino" dataKey="metaSupino" stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" name="Meta Agacho" dataKey="metaAgachamento" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" name="Meta Terra" dataKey="metaTerra" stroke="#ec4899" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Nenhum registro de carga ainda. Clique em "Registrar Peso & Cargas".
                </div>
              )}
            </div>
          </div>

          {/* Smart Silent Load Re-Adjustment Targets Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Reajustes de Carga Recomendados para as Próximas Sessões
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loadAdjustments.summaryMessage}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Supino Reto</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {loadAdjustments.currentBench}kg ➔ <span className="text-blue-600 dark:text-blue-400">{loadAdjustments.targetBench}kg</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +{Math.round((loadAdjustments.targetBench - loadAdjustments.currentBench) * 10) / 10}kg
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Agachamento</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {loadAdjustments.currentSquat}kg ➔ <span className="text-amber-500">{loadAdjustments.targetSquat}kg</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +{Math.round((loadAdjustments.targetSquat - loadAdjustments.currentSquat) * 10) / 10}kg
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Levant. Terra</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {loadAdjustments.currentDeadlift}kg ➔ <span className="text-pink-500">{loadAdjustments.targetDeadlift}kg</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +{Math.round((loadAdjustments.targetDeadlift - loadAdjustments.currentDeadlift) * 10) / 10}kg
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Desenvolvimento</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {loadAdjustments.currentOverhead}kg ➔ <span className="text-emerald-500">{loadAdjustments.targetOverhead}kg</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +{Math.round((loadAdjustments.targetOverhead - loadAdjustments.currentOverhead) * 10) / 10}kg
                </span>
              </div>
            </div>
          </div>

          {/* History of Load Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-3 shadow-xs transition-colors">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Histórico de Cargas e Peso
            </h2>

            <div className="space-y-2.5">
              {evolutionLogs.slice().reverse().map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 shrink-0">
                      {log.date}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      Peso: {log.weightKg} kg
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    {log.benchPressKg ? (
                      <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                        Supino: <strong>{log.benchPressKg}kg</strong>
                      </span>
                    ) : null}
                    {log.squatKg ? (
                      <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                        Agacho: <strong>{log.squatKg}kg</strong>
                      </span>
                    ) : null}
                    {log.deadliftKg ? (
                      <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                        Terra: <strong>{log.deadliftKg}kg</strong>
                      </span>
                    ) : null}
                    {log.overheadPressKg ? (
                      <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                        Desenv: <strong>{log.overheadPressKg}kg</strong>
                      </span>
                    ) : null}
                  </div>

                  {log.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic sm:max-w-xs truncate">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: DEFINIÇÃO CORPORAL E MEDIDAS */}
      {/* ========================================================================= */}
      {activeEvolutionTab === 'definition' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Overview Stat Cards for Body Definition */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Nível Definição</span>
              </div>
              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1.5 truncate">
                {latestDefLog?.definitionLevel || 'Moderada'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Aspecto muscular</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cintura</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {latestDefLog?.waistCm || 82} cm
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Gordura abdominal</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <Ruler className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Braço / Bíceps</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1.5">
                {latestDefLog?.armsCm || 36} cm
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Circunferência</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                <Ruler className="w-4 h-4 text-amber-500" />
                <span>Peitoral</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1.5">
                {latestDefLog?.chestCm || 98} cm
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tórax superior</p>
            </div>
          </div>

          {/* Body Measurements Chart with Projections */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Evolução de Medidas & Curva de Reajuste (cm)</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  As linhas tracejadas projetam o reajuste ideal de cintura e braço para as proporções do seu corpo.
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              {defAdjustments.chartDataWithProjections.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={defAdjustments.chartDataWithProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 4', 'dataMax + 6']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" name="Cintura (cm)" dataKey="cintura" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" name="Braço (cm)" dataKey="braco" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" name="Peitoral (cm)" dataKey="peitoral" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" name="Coxa (cm)" dataKey="coxa" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" name="Meta Cintura" dataKey="metaCintura" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" name="Meta Braço" dataKey="metaBraco" stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Nenhum registro de medida ainda. Clique em "Registrar Medidas & Definição".
                </div>
              )}
            </div>
          </div>

          {/* Smart Silent Body Definition & Proportions Target Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Reajustes Antropométricos e Proporção Ideal
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {defAdjustments.summaryMessage}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Cintura (Afunilamento)</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {defAdjustments.currentWaist}cm ➔ <span className="text-rose-500">{defAdjustments.targetWaist}cm</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Relação: {defAdjustments.waistToHeightRatio} (Ideal: ≤0.45)
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Braço / Bíceps</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {defAdjustments.currentArms}cm ➔ <span className="text-emerald-500">{defAdjustments.targetArms}cm</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +{Math.round((defAdjustments.targetArms - defAdjustments.currentArms) * 10) / 10}cm
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Peitoral</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                  {defAdjustments.currentChest}cm ➔ <span className="text-blue-500">{defAdjustments.targetChest}cm</span>
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  +{Math.round((defAdjustments.targetChest - defAdjustments.currentChest) * 10) / 10}cm
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Definição Projetada</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5 truncate">
                  {defAdjustments.targetLevel}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Meta da fase
                </span>
              </div>
            </div>
          </div>

          {/* History of Definition Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-3 shadow-xs transition-colors">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Histórico de Definição e Medidas
            </h2>

            <div className="space-y-2.5">
              {evolutionLogs
                .filter((l) => l.waistCm || l.armsCm || l.chestCm || l.definitionLevel)
                .slice()
                .reverse()
                .map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
                        {log.date}
                      </span>
                      {log.definitionLevel && (
                        <span className="bg-slate-900 dark:bg-slate-950 text-emerald-400 px-2 py-0.5 rounded font-bold text-[11px] border border-emerald-500/30">
                          {log.definitionLevel}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      {log.waistCm ? (
                        <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                          Cintura: <strong className="text-rose-600 dark:text-rose-400">{log.waistCm}cm</strong>
                        </span>
                      ) : null}
                      {log.armsCm ? (
                        <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                          Braço: <strong>{log.armsCm}cm</strong>
                        </span>
                      ) : null}
                      {log.chestCm ? (
                        <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                          Peito: <strong>{log.chestCm}cm</strong>
                        </span>
                      ) : null}
                      {log.thighsCm ? (
                        <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
                          Coxa: <strong>{log.thighsCm}cm</strong>
                        </span>
                      ) : null}
                    </div>

                    {log.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic sm:max-w-xs truncate">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR PESO E CARGAS (Allows clearing all digits up to zero) */}
      {/* ========================================================================= */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 relative my-8">
            <button
              onClick={() => setShowLoadModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                1. Registro de Cargas & Força
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Novo Registro de Carga / Peso
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Você pode apagar e digitar livremente qualquer valor.
              </p>
            </div>

            <form onSubmit={handleSaveLoadLog} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peso Corporal Atual (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="Ex: 75.5"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supino Reto (kg)
                  </label>
                  <input
                    type="number"
                    value={benchPressKg}
                    onChange={(e) => setBenchPressKg(e.target.value)}
                    placeholder="60"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Agachamento (kg)
                  </label>
                  <input
                    type="number"
                    value={squatKg}
                    onChange={(e) => setSquatKg(e.target.value)}
                    placeholder="80"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Levant. Terra (kg)
                  </label>
                  <input
                    type="number"
                    value={deadliftKg}
                    onChange={(e) => setDeadliftKg(e.target.value)}
                    placeholder="90"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Desenvolvimento (kg)
                  </label>
                  <input
                    type="number"
                    value={overheadPressKg}
                    onChange={(e) => setOverheadPressKg(e.target.value)}
                    placeholder="40"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações sobre a carga / treino
                </label>
                <textarea
                  rows={2}
                  value={loadNotes}
                  onChange={(e) => setLoadNotes(e.target.value)}
                  placeholder="Ex: Aumentei carga no supino com execução perfeita..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoadModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Salvar Cargas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTRAR DEFINIÇÃO E MEDIDAS (Allows clearing all digits up to zero) */}
      {/* ========================================================================= */}
      {showDefinitionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 relative my-8">
            <button
              onClick={() => setShowDefinitionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                2. Registro de Medidas & Definição
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Nova Avaliação Corporal e Medidas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhe a redução da cintura e o ganho de contorno muscular.
              </p>
            </div>

            <form onSubmit={handleSaveDefinitionLog} className="space-y-3.5 text-xs">
              {/* Definition Level Stage Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Estágio de Definição Atual
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Inicial', 'Leve', 'Moderada', 'Alta Definição', 'Muito Rasgado'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDefinitionLevel(lvl)}
                      className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                        definitionLevel === lvl
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight & Body fat */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peso no Momento (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={defWeightKg}
                    onChange={(e) => setDefWeightKg(e.target.value)}
                    placeholder="70"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    % Gordura (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFatPercent}
                    onChange={(e) => setBodyFatPercent(e.target.value)}
                    placeholder="Ex: 14%"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Body Circumferences (cm) */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cintura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    placeholder="82"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Braço (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={armsCm}
                    onChange={(e) => setArmsCm(e.target.value)}
                    placeholder="36"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peitoral (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value)}
                    placeholder="98"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Coxas (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={thighsCm}
                    onChange={(e) => setThighsCm(e.target.value)}
                    placeholder="56"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quadril (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={hipsCm}
                    onChange={(e) => setHipsCm(e.target.value)}
                    placeholder="96"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações sobre a definição / físico
                </label>
                <textarea
                  rows={2}
                  value={definitionNotes}
                  onChange={(e) => setDefinitionNotes(e.target.value)}
                  placeholder="Ex: Abdômen mais aparente, vascularização visível nos braços..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDefinitionModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Salvar Medidas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


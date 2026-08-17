import React, { useState } from 'react';
import { Plus, TrendingUp, Dumbbell, Award, Flame, Scale, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CompletedSession, EvolutionLog, UserProfile } from '../types';

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
  const [showLogModal, setShowLogModal] = useState(false);
  const [newWeight, setNewWeight] = useState<number>(profile.weight);
  const [benchPressKg, setBenchPressKg] = useState<number>(60);
  const [squatKg, setSquatKg] = useState<number>(80);
  const [deadliftKg, setDeadliftKg] = useState<number>(90);
  const [logNotes, setLogNotes] = useState('');

  // Prepare chart data for weight progression
  const weightChartData = evolutionLogs.map((log) => ({
    date: log.date.substring(5), // MM-DD
    peso: log.weightKg,
    supino: log.benchPressKg || null,
    agachamento: log.squatKg || null,
  }));

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: EvolutionLog = {
      id: `evo_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(newWeight) || profile.weight,
      benchPressKg: Number(benchPressKg) || 0,
      squatKg: Number(squatKg) || 0,
      deadliftKg: Number(deadliftKg) || 0,
      notes: logNotes,
    };
    onAddEvolutionLog(newLog);
    setShowLogModal(false);
  };

  const totalCompletedSessions = history.length;
  const totalTrainingMinutes = history.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-in fade-in pb-28">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700 inline-block">
            MÉTRICAS & PROGRESSO
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 sm:mt-2">
            Evolução e Cargas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Acompanhe o ganho de força e peso corporal ao longo do tempo.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTRAR PESO/CARGAS</span>
        </button>
      </div>

      {/* Overview Stat Cards (2 cols on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Peso Atual</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {evolutionLogs[evolutionLogs.length - 1]?.weight || profile.weight} kg
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Meta: {profile.objective}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Treinos Feitos</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {totalCompletedSessions} sessões
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{totalTrainingMinutes} min totais</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Supino Reto</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {evolutionLogs[evolutionLogs.length - 1]?.benchPressKg || 60} kg
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Carga máxima registrada</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Agachamento</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1.5">
            {evolutionLogs[evolutionLogs.length - 1]?.squatKg || 80} kg
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Carga máxima registrada</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Histórico Gráfico de Peso Corporal (kg)</span>
        </h2>

        <div className="h-56 sm:h-72 w-full pt-2">
          {weightChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563eb' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Nenhum dado registrado para gerar o gráfico.
            </div>
          )}
        </div>
      </div>

      {/* History Log Entries (Responsive list/cards) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-3 shadow-xs transition-colors">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Registros Anteriores
        </h2>

        <div className="space-y-2">
          {evolutionLogs.slice().reverse().map((log) => (
            <div
              key={log.id}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Novo Registro de Carga / Peso
            </h3>

            <form onSubmit={handleSaveLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peso Corporal (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supino (kg)
                  </label>
                  <input
                    type="number"
                    value={benchPressKg}
                    onChange={(e) => setBenchPressKg(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Agachamento (kg)
                  </label>
                  <input
                    type="number"
                    value={squatKg}
                    onChange={(e) => setSquatKg(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Ex: Aumentei carga no supino sem dor..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

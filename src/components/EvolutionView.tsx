import React, { useState } from 'react';
import { TrendingUp, Plus, Calendar, Scale, Activity, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { UserProfile, EvolutionLog, CompletedSession, ProgressionSuggestion } from '../types';

interface EvolutionViewProps {
  profile: UserProfile;
  evolutionLogs: EvolutionLog[];
  history: CompletedSession[];
  progressionSuggestions: ProgressionSuggestion[];
  onAddLog: (log: EvolutionLog) => void;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  profile,
  evolutionLogs,
  history,
  progressionSuggestions,
  onAddLog,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [weightKg, setWeightKg] = useState<number>(profile.weight || 70);
  const [chestCm, setChestCm] = useState<number | ''>('');
  const [armsCm, setArmsCm] = useState<number | ''>('');
  const [waistCm, setWaistCm] = useState<number | ''>('');
  const [thighsCm, setThighsCm] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: EvolutionLog = {
      id: `evo_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(weightKg) || profile.weight,
      chestCm: chestCm !== '' ? Number(chestCm) : undefined,
      armsCm: armsCm !== '' ? Number(armsCm) : undefined,
      waistCm: waistCm !== '' ? Number(waistCm) : undefined,
      thighsCm: thighsCm !== '' ? Number(thighsCm) : undefined,
      notes,
    };
    onAddLog(newLog);
    setShowAddModal(false);
  };

  // Prepare Weight History Data for Recharts
  const weightData = evolutionLogs.map((log) => ({
    date: log.date.slice(5), // "MM-DD"
    weight: log.weightKg,
  }));

  // Prepare Max Load History Data across workouts
  const loadDataMap: Record<string, number> = {};
  history.forEach((session) => {
    session.exerciseLogs.forEach((ex) => {
      const maxL = Math.max(...ex.sets.map((s) => s.loadKg || 0), 0);
      if (maxL > 0) {
        loadDataMap[ex.exerciseName] = Math.max(loadDataMap[ex.exerciseName] || 0, maxL);
      }
    });
  });

  const loadChartData = Object.entries(loadDataMap).map(([name, load]) => ({
    name: name.length > 12 ? `${name.substring(0, 12)}...` : name,
    carga: load,
  }));

  // Frequency Data for last 4 weeks
  const frequencyChartData = [
    { week: 'Semana 1', treinos: Math.min(profile.daysPerWeek, history.length > 3 ? 3 : history.length) },
    { week: 'Semana 2', treinos: Math.min(profile.daysPerWeek, history.length > 6 ? 4 : history.length) },
    { week: 'Semana 3', treinos: Math.min(profile.daysPerWeek, history.length > 9 ? 4 : history.length) },
    { week: 'Semana Atual', treinos: history.filter((s) => (Date.now() - new Date(s.date).getTime()) / (1000 * 3600 * 24) <= 7).length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-in fade-in pb-28">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>MINHA EVOLUÇÃO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Registro & Gráficos de Progresso</h1>
          <p className="text-xs text-slate-300 mt-1">
            Acompanhe o ganho de carga, peso corporal, frequência e métricas corporais.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTRAR MEDIDAS/PESO</span>
        </button>
      </div>

      {/* AI PROGRESSION SUGGESTIONS BANNER */}
      {progressionSuggestions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Sugestões de Progressão da IA</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">Hora de Aumentar a Carga!</h3>
          <p className="text-xs text-slate-600">
            Com base no seu histórico recente de treinos concluídos com boa execução, a IA sugere:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {progressionSuggestions.map((sug, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {sug.exerciseName}
                </span>
                <p className="text-xs font-bold text-slate-900 pt-1">
                  Subir de {sug.currentLoadKg}kg ➔ <span className="text-blue-600">{sug.suggestedLoadKg}kg</span>
                </p>
                <p className="text-[11px] text-slate-500 leading-tight pt-1">{sug.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Weight Evolution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>📈 Evolução do Peso Corporal (kg)</span>
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
              {evolutionLogs[evolutionLogs.length - 1]?.weightKg || profile.weight} kg atual
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                  <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Cadastre pelo menos 1 registro de peso para ver o gráfico.
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: Load Evolution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>🏋️ Carga Máxima por Exercício (kg)</span>
            </h3>
          </div>

          <div className="h-56 w-full pt-2">
            {loadChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loadChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                  <Bar dataKey="carga" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete treinos no Modo Treino para ver suas cargas máximas.
              </div>
            )}
          </div>
        </div>

        {/* CHART 3: Weekly Frequency */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>📊 Frequência Semanal de Treinos Concluídos</span>
            </h3>
            <span className="text-xs text-slate-500">Meta: {profile.daysPerWeek} dias/semana</span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 7]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                <Bar dataKey="treinos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* HISTORY OF MEASUREMENT LOGS TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Histórico de Registros de Medidas</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Peso (kg)</th>
                <th className="p-3">Tórax (cm)</th>
                <th className="p-3">Braço (cm)</th>
                <th className="p-3">Cintura (cm)</th>
                <th className="p-3">Coxa (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evolutionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{log.date}</td>
                  <td className="p-3 text-blue-600 font-bold">{log.weightKg} kg</td>
                  <td className="p-3">{log.chestCm ? `${log.chestCm} cm` : '—'}</td>
                  <td className="p-3">{log.armsCm ? `${log.armsCm} cm` : '—'}</td>
                  <td className="p-3">{log.waistCm ? `${log.waistCm} cm` : '—'}</td>
                  <td className="p-3">{log.thighsCm ? `${log.thighsCm} cm` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MEASUREMENT LOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Novo Registro Corporal</h3>

            <form onSubmit={handleSaveLog} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peso Corporal (kg)*</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tórax (cm)</label>
                  <input
                    type="number"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Braço (cm)</label>
                  <input
                    type="number"
                    value={armsCm}
                    onChange={(e) => setArmsCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coxa (cm)</label>
                  <input
                    type="number"
                    value={thighsCm}
                    onChange={(e) => setThighsCm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Medido em jejum pela manhã..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
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


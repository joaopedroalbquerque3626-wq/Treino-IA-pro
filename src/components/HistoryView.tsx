import React, { useState } from 'react';
import { History, Clock, ChevronRight, Search, FileText, X } from 'lucide-react';
import { CompletedSession } from '../types';

interface HistoryViewProps {
  history: CompletedSession[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<CompletedSession | null>(null);

  const filteredHistory = history.filter((s) =>
    s.workoutTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.date.includes(searchTerm)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-in fade-in pb-28">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>HISTÓRICO DE TREINOS</span>
          </div>
          <h1 className="text-2xl font-black text-white">Sessões Anteriores Registradas</h1>
          <p className="text-xs text-slate-300 mt-1">
            Consulte datas, cargas, repetições e notas de treinos passados.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por treino ou data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* SESSIONS LIST */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-2 shadow-sm">
            <FileText className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700">Nenhum treino registrado ainda</p>
            <p className="text-xs">Complete seu primeiro treino no aplicativo para ver o histórico aqui.</p>
          </div>
        ) : (
          filteredHistory.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {session.date}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    {session.durationMinutes} min
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {session.workoutTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {session.exerciseLogs.length} exercícios concluídos
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                  Ver Detalhes
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SESSION DETAIL MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                  {selectedSession.date}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedSession.workoutTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Detalhamento por Exercício:
              </h4>

              {selectedSession.exerciseLogs.map((ex, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{ex.exerciseName}</span>
                    <span className="text-blue-600">{ex.muscleGroup}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] text-slate-700">
                    {ex.sets.map((set, sIdx) => (
                      <div key={sIdx} className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="block font-bold text-slate-400">Série {set.setIndex}</span>
                        <span className="text-slate-900 font-extrabold">{set.repsCompleted} reps</span> @ {set.loadKg}kg
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedSession.notes && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                <strong>Observações da Sessão:</strong> {selectedSession.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


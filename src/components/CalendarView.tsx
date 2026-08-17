import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CompletedSession } from '../types';

interface CalendarViewProps {
  history: CompletedSession[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ history }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<CompletedSession | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getSessionsForDay = (day: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    return history.filter((s) => s.date === dateKey);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-in fade-in pb-28">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>CALENDÁRIO DE TREINAMENTO</span>
          </div>
          <h1 className="text-2xl font-black text-white">Frequência Semanal e Histórico</h1>
          <p className="text-xs text-slate-300 mt-1">
            Clique em qualquer data para revisar o treino realizado.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-200 bg-slate-800 p-3 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>✓ Concluído</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-500" />
            <span>○ Planejado</span>
          </div>
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs transition-colors">
        {/* Month Selector Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((w) => (
            <div key={w} className="py-2">{w}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty_${idx}`} className="h-16 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30" />;
            }

            const sessions = getSessionsForDay(day);
            const isCompleted = sessions.length > 0;
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={`day_${day}`}
                onClick={() => isCompleted && setSelectedSession(sessions[0])}
                className={`h-16 sm:h-20 rounded-2xl p-2 border flex flex-col justify-between transition-all select-none ${
                  isCompleted
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-slate-900 dark:text-white hover:border-blue-400 cursor-pointer shadow-xs'
                    : isToday
                    ? 'bg-white dark:bg-slate-800 border-blue-600 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${isToday ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-700 dark:text-slate-300'}`}>
                    {day}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>

                {isCompleted && (
                  <div className="truncate text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-700">
                    {sessions[0].workoutTitle}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SESSION DETAILS MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Treino Concluído em {selectedSession.date}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSession.workoutTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Duração: {selectedSession.durationMinutes} minutos</span>
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Exercícios Realizados:
              </h4>

              {selectedSession.exerciseLogs.map((ex, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>{ex.exerciseName}</span>
                    <span className="text-blue-600 dark:text-blue-400">{ex.muscleGroup}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-700 dark:text-slate-300">
                    {ex.sets.map((set, sIdx) => (
                      <span key={sIdx} className="bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-medium shadow-2xs">
                        Série {set.setIndex}: {set.repsCompleted} reps x {set.loadKg}kg
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedSession.notes && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <strong>Observações:</strong> {selectedSession.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

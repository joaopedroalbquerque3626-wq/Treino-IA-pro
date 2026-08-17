import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Dumbbell, Clock } from 'lucide-react';
import { CompletedSession, WorkoutPlan } from '../types';

interface CalendarViewProps {
  history: CompletedSession[];
  workoutPlan: WorkoutPlan | null;
  onSelectDateSession?: (session: CompletedSession) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ history, workoutPlan }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDaySessions, setSelectedDaySessions] = useState<CompletedSession[] | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDaySessions(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDaySessions(null);
  };

  // Group history by date (YYYY-MM-DD)
  const historyByDate: Record<string, CompletedSession[]> = {};
  history.forEach((session) => {
    if (!historyByDate[session.date]) {
      historyByDate[session.date] = [];
    }
    historyByDate[session.date].push(session);
  });

  const handleDayClick = (dayNumber: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    const sessions = historyByDate[formattedDate] || [];
    setSelectedDateStr(formattedDate);
    setSelectedDaySessions(sessions);
  };

  const totalThisMonth = history.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-in fade-in pb-28">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700 inline-block">
            CALENDÁRIO & FREQUÊNCIA
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 sm:mt-2">
            Histórico Mensal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Acompanhe a sua constância e sessões registradas.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 self-start sm:self-auto">
          <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {totalThisMonth} {totalThisMonth === 1 ? 'treino realizado' : 'treinos realizados'}
          </span>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-500 py-1">
          <span>DOM</span>
          <span>SEG</span>
          <span>TER</span>
          <span>QUA</span>
          <span>QUI</span>
          <span>SEX</span>
          <span>SÁB</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[44px] sm:min-h-[64px] rounded-xl bg-slate-50/50 dark:bg-slate-800/20" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const sessionsForDay = historyByDate[formattedDate] || [];
            const hasWorkout = sessionsForDay.length > 0;
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;
            const isSelected = selectedDateStr === formattedDate;

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleDayClick(dayNum)}
                className={`min-h-[44px] sm:min-h-[64px] p-1 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/50 dark:bg-blue-900/30'
                    : hasWorkout
                    ? 'bg-blue-50/60 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/60 hover:border-blue-400'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span
                    className={`text-[11px] sm:text-xs font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasWorkout && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </div>

                {hasWorkout ? (
                  <div className="mt-0.5 sm:mt-1">
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 truncate block leading-none">
                      {sessionsForDay[0]?.workoutTitle.replace('Treino ', '')}
                    </span>
                  </div>
                ) : (
                  <div className="h-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Workout Details Card */}
      {selectedDaySessions && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-3 shadow-xs animate-in fade-in transition-colors">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Detalhes do dia {selectedDateStr}</span>
          </h3>

          {selectedDaySessions.length > 0 ? (
            <div className="space-y-3">
              {selectedDaySessions.map((session, idx) => (
                <div
                  key={session.id || idx}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{session.workoutTitle}</span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.durationMinutes} min
                    </span>
                  </div>

                  {session.exerciseLogs && session.exerciseLogs.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Exercícios realizados:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        {session.exerciseLogs.map((log, exIdx) => (
                          <div key={exIdx} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50 flex justify-between">
                            <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{log.exerciseName}</span>
                            <span className="text-slate-400 font-bold ml-2 shrink-0">{log.sets.length} séries</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.notes && (
                    <p className="text-slate-600 dark:text-slate-300 italic pt-1 text-[11px]">
                      "{session.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
              Nenhuma sessão de treino concluída nesta data selecionada.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

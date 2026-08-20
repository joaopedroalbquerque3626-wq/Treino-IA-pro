import React, { useEffect, useRef, useState } from 'react';
import { Timer, Play, Pause, Plus, Minus, X } from 'lucide-react';

interface RestTimerModalProps {
  isOpen: boolean;
  seconds: number;
  onClose: () => void;
  onTimerComplete?: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  isOpen,
  seconds,
  onClose,
  onTimerComplete,
}) => {
  const safeInitialSeconds = Math.max(5, Math.min(600, Number(seconds) || 60));
  const [secondsLeft, setSecondsLeft] = useState(safeInitialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [totalTime, setTotalTime] = useState(safeInitialSeconds);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(safeInitialSeconds);
    setTotalTime(safeInitialSeconds);
    setIsRunning(true);
    completedRef.current = false;
  }, [isOpen, safeInitialSeconds]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isRunning || secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((previous) => Math.max(0, previous - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [isOpen, isRunning, secondsLeft]);

  useEffect(() => {
    if (!isOpen || secondsLeft !== 0 || completedRef.current) return;
    completedRef.current = true;
    setIsRunning(false);
    onTimerComplete?.();
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    } catch {
      // Vibration is optional and may be blocked by the device/browser.
    }
  }, [isOpen, secondsLeft, onTimerComplete]);

  if (!isOpen) return null;

  const handlePreset = (secs: number) => {
    const next = Math.max(5, Math.min(600, secs));
    setSecondsLeft(next);
    setTotalTime(next);
    setIsRunning(true);
    completedRef.current = false;
  };

  const handleAdjust = (delta: number) => {
    const next = Math.max(5, Math.min(600, secondsLeft + delta));
    setSecondsLeft(next);
    setTotalTime((previous) => Math.max(previous, next));
    completedRef.current = false;
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secondsRemainder = secondsLeft % 60;
  const progressPercent = totalTime > 0 ? Math.min(100, Math.max(0, ((totalTime - secondsLeft) / totalTime) * 100)) : 100;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rest-timer-title"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in zoom-in-95 transition-colors max-h-[90dvh] overflow-y-auto"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar timer de descanso"
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2 pr-10">
          <Timer className="w-4 h-4" aria-hidden="true" />
          <span id="rest-timer-title">Timer de Descanso</span>
        </div>

        <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center" aria-live="polite" aria-label={`${secondsLeft} segundos restantes`}>
          <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
            <circle cx="88" cy="88" r="72" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="transparent" />
            <circle
              cx="88"
              cy="88"
              r="72"
              className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-1000"
              strokeWidth="8"
              strokeDasharray={452}
              strokeDashoffset={452 - (452 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {String(minutes).padStart(2, '0')}:{String(secondsRemainder).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">
              {secondsLeft === 0 ? 'DESCANSO CONCLUÍDO' : 'Intervalo entre séries'}
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 mb-6">
          <button type="button" onClick={() => handleAdjust(-10)} aria-label="Diminuir 10 segundos" className="min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer">
            <Minus className="w-4 h-4" aria-hidden="true" /> 10s
          </button>

          <button
            type="button"
            onClick={() => setIsRunning((previous) => !previous)}
            aria-label={isRunning ? 'Pausar timer' : 'Continuar timer'}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            {isRunning ? <Pause className="w-6 h-6 fill-white" aria-hidden="true" /> : <Play className="w-6 h-6 fill-white ml-0.5" aria-hidden="true" />}
          </button>

          <button type="button" onClick={() => handleAdjust(10)} aria-label="Adicionar 10 segundos" className="min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer">
            <Plus className="w-4 h-4" aria-hidden="true" /> 10s
          </button>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ajuste rápido de tempo:</p>
          <div className="grid grid-cols-5 gap-1.5">
            {[30, 45, 60, 90, 120].map((sec) => (
              <button
                type="button"
                key={sec}
                onClick={() => handlePreset(sec)}
                aria-pressed={totalTime === sec}
                className={`min-h-[40px] py-1.5 px-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  totalTime === sec
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

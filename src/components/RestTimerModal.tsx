import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, Plus, Minus, X } from 'lucide-react';

interface RestTimerModalProps {
  isOpen: boolean;
  initialSeconds: number;
  onClose: () => void;
  onTimerComplete?: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  isOpen,
  initialSeconds,
  onClose,
  onTimerComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [totalTime, setTotalTime] = useState(initialSeconds);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(initialSeconds);
      setTotalTime(initialSeconds);
      setIsRunning(true);
    }
  }, [isOpen, initialSeconds]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      if (onTimerComplete) onTimerComplete();
      // Audio or vibration cue simulation
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, onTimerComplete]);

  if (!isOpen) return null;

  const handlePreset = (secs: number) => {
    setSecondsLeft(secs);
    setTotalTime(secs);
    setIsRunning(true);
  };

  const handleAdjust = (delta: number) => {
    const next = Math.max(5, secondsLeft + delta);
    setSecondsLeft(next);
    if (next > totalTime) setTotalTime(next);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = totalTime > 0 ? ((totalTime - secondsLeft) / totalTime) * 100 : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
          <Timer className="w-4 h-4" />
          <span>Timer de Descanso</span>
        </div>

        {/* Circular Countdown Display */}
        <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="72"
              className="stroke-slate-100"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r="72"
              className="stroke-blue-600 transition-all duration-1000"
              strokeWidth="8"
              strokeDasharray={452}
              strokeDashoffset={452 - (452 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-900 tracking-tight font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
              {secondsLeft === 0 ? 'DESCANSO CONCLUÍDO! 🔥' : 'Intervalo entre séries'}
            </span>
          </div>
        </div>

        {/* Adjust Time Buttons */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            onClick={() => handleAdjust(-10)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <Minus className="w-4 h-4" /> 10s
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            onClick={() => handleAdjust(10)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> 10s
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 font-medium">Ajuste rápido de tempo:</p>
          <div className="grid grid-cols-5 gap-1.5">
            {[30, 45, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => handlePreset(sec)}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  totalTime === sec
                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
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

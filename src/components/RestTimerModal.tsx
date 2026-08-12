import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, Minus, X, Volume2 } from 'lucide-react';

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
      if ('vibrate' in navigator) {
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Timer className="w-4 h-4 animate-spin" />
          <span>Timer de Descanso</span>
        </div>

        {/* Circular Countdown Display */}
        <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              className="stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              className="stroke-emerald-400 transition-all duration-1000"
              strokeWidth="10"
              strokeDasharray={502}
              strokeDashoffset={502 - (502 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-tight font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
              {secondsLeft === 0 ? 'DESCANSO CONCLUÍDO! 🔥' : 'Recuperando oxigênio'}
            </span>
          </div>
        </div>

        {/* Adjust Time Buttons */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            onClick={() => handleAdjust(-10)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Minus className="w-4 h-4" /> 10s
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-4 rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            {isRunning ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
          </button>

          <button
            onClick={() => handleAdjust(10)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> 10s
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 font-medium">Tempos rápidos:</p>
          <div className="grid grid-cols-5 gap-1.5">
            {[30, 45, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => handlePreset(sec)}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition-colors ${
                  totalTime === sec
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
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

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Check, Sparkles, X, Dumbbell, AlertCircle } from 'lucide-react';
import { Exercise, ExerciseAlternative, UserProfile } from '../types';
import { fetchAIExerciseAlternatives } from '../services/aiApi';

interface SubstituteModalProps {
  isOpen: boolean;
  exercise: Exercise | null;
  profile: UserProfile | null;
  onClose: () => void;
  onSelectAlternative: (oldExerciseId: string, newExercise: Exercise) => void;
}

export const SubstituteModal: React.FC<SubstituteModalProps> = ({ isOpen, exercise, profile, onClose, onSelectAlternative }) => {
  const [alternatives, setAlternatives] = useState<ExerciseAlternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    let cancelled = false;
    if (!isOpen || !exercise) return;
    setAlternatives([]);
    setError('');

    if (!profile) {
      setLoading(false);
      setError('Seu perfil não está disponível. Volte ao perfil e tente novamente.');
      return;
    }

    setLoading(true);
    fetchAIExerciseAlternatives(exercise, profile)
      .then((alts) => {
        if (cancelled) return;
        const clean = alts
          .filter((alt) => alt?.alternativeName && alt.alternativeName.toLowerCase() !== exercise.name.toLowerCase())
          .slice(0, 3);
        setAlternatives(clean);
        if (!clean.length) setError('Nenhuma alternativa compatível foi encontrada para este exercício e seus equipamentos.');
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Não foi possível buscar alternativas agora.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, exercise, profile]);

  if (!isOpen || !exercise) return null;

  const handleApplyAlternative = (alt: ExerciseAlternative) => {
    if (!alt.alternativeName || !alt.requiredEquipment) return;
    const replacement: Exercise = {
      ...exercise,
      name: alt.alternativeName,
      equipment: alt.requiredEquipment,
      executionTip: alt.reason || exercise.executionTip,
      isCompleted: false,
      setLogs: [],
    };
    onSelectAlternative(exercise.id, replacement);
    onClose();
  };

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
        aria-labelledby="substitute-title"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative animate-in zoom-in-95 max-h-[90dvh] flex flex-col justify-between transition-colors"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar substituição de exercício"
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="pr-12">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Substituição Inteligente com IA</span>
          </div>
          <h3 id="substitute-title" className="text-xl font-bold text-slate-900 dark:text-white">Substituir Exercício</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Original: <strong className="text-slate-800 dark:text-slate-200">{exercise.name}</strong> ({exercise.muscleGroup})
          </p>
        </div>

        <div className="my-6 space-y-3 overflow-y-auto max-h-[50dvh] pr-1" aria-live="polite">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto" aria-hidden="true" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Buscando alternativas compatíveis com seu perfil e equipamentos...</p>
            </div>
          ) : error ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400 space-y-1" role="status">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : (
            alternatives.map((alt, index) => (
              <div key={`${alt.alternativeName}-${index}`} className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 hover:border-blue-300 dark:hover:border-blue-500 transition-all group">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700">Opção {index + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{alt.alternativeName}</h4>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 break-words max-w-[45%]">
                    <Dumbbell className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                    {alt.requiredEquipment}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">💡 {alt.reason}</p>
                <button
                  type="button"
                  onClick={() => handleApplyAlternative(alt)}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>USAR ESTA ALTERNATIVA</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">As alternativas são filtradas para manter o mesmo foco muscular e respeitar os equipamentos disponíveis.</p>
        </div>
      </div>
    </div>
  );
};

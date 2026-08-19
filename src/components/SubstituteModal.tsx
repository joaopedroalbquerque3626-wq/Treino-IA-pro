import React, { useEffect, useState } from 'react';
import { RefreshCw, Check, Sparkles, X, Dumbbell, AlertCircle } from 'lucide-react';
import { Exercise, ExerciseAlternative, UserProfile } from '../types';
import { fetchAIExerciseAlternatives } from '../services/aiApi';

interface SubstituteModalProps {
  isOpen: boolean;
  exercise: Exercise | null;
  profile: UserProfile;
  onClose: () => void;
  onSelectAlternative: (oldExerciseId: string, newExercise: Exercise) => void;
}

export const SubstituteModal: React.FC<SubstituteModalProps> = ({ isOpen, exercise, profile, onClose, onSelectAlternative }) => {
  const [alternatives, setAlternatives] = useState<ExerciseAlternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!isOpen || !exercise) return;
    setAlternatives([]);
    setError('');
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
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isOpen, exercise, profile]);

  if (!isOpen || !exercise) return null;

  const handleApplyAlternative = (alt: ExerciseAlternative) => {
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Substituir exercício">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] flex flex-col justify-between transition-colors">
        <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>

        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1"><Sparkles className="w-4 h-4" /><span>Substituição Inteligente com IA</span></div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Substituir Exercício</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Original: <strong className="text-slate-800 dark:text-slate-200">{exercise.name}</strong> ({exercise.muscleGroup})</p>
        </div>

        <div className="my-6 space-y-3 overflow-y-auto max-h-[50vh] pr-1">
          {loading ? (
            <div className="py-12 text-center space-y-3"><RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto" /><p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Buscando alternativas compatíveis com seu perfil e equipamentos...</p></div>
          ) : error ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400 space-y-1"><AlertCircle className="w-5 h-5 text-amber-500 mx-auto" /><p>{error}</p></div>
          ) : (
            alternatives.map((alt, index) => (
              <div key={`${alt.alternativeName}-${index}`} className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 hover:border-blue-300 dark:hover:border-blue-500 transition-all group">
                <div className="flex justify-between items-start gap-3"><div><span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700">Opção {index + 1}</span><h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{alt.alternativeName}</h4></div><span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1"><Dumbbell className="w-3 h-3 text-blue-600 dark:text-blue-400" />{alt.requiredEquipment}</span></div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">💡 {alt.reason}</p>
                <button onClick={() => handleApplyAlternative(alt)} className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"><Check className="w-4 h-4" /><span>USAR ESTA ALTERNATIVA</span></button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center"><p className="text-[10px] text-slate-400 dark:text-slate-500">As alternativas são filtradas para manter o mesmo foco muscular e respeitar os equipamentos disponíveis.</p></div>
      </div>
    </div>
  );
};

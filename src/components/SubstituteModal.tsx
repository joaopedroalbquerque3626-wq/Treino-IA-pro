import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Sparkles, X, Dumbbell, AlertCircle } from 'lucide-react';
import { Exercise, ExerciseAlternative, UserProfile } from '../types';
import { fetchAIExerciseAlternatives } from '../services/workoutEngine';

interface SubstituteModalProps {
  isOpen: boolean;
  exercise: Exercise | null;
  profile: UserProfile;
  onClose: () => void;
  onSelectAlternative: (oldExerciseId: string, newExercise: Exercise) => void;
}

export const SubstituteModal: React.FC<SubstituteModalProps> = ({
  isOpen,
  exercise,
  profile,
  onClose,
  onSelectAlternative,
}) => {
  const [alternatives, setAlternatives] = useState<ExerciseAlternative[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && exercise) {
      setLoading(true);
      fetchAIExerciseAlternatives(exercise, profile)
        .then((alts) => {
          setAlternatives(alts);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, exercise, profile]);

  if (!isOpen || !exercise) return null;

  const handleApplyAlternative = (alt: ExerciseAlternative) => {
    const replacement: Exercise = {
      ...exercise,
      name: alt.alternativeName,
      equipment: alt.requiredEquipment,
      executionTip: `Substituição por IA: ${alt.reason}`,
    };
    onSelectAlternative(exercise.id, replacement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] flex flex-col justify-between">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Substituição Inteligente com IA</span>
          </div>

          <h3 className="text-xl font-black text-white">Substituir Exercício</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Original: <strong className="text-emerald-400">{exercise.name}</strong> ({exercise.muscleGroup})
          </p>
        </div>

        {/* Alternatives List */}
        <div className="my-6 space-y-3 overflow-y-auto max-h-[50vh] pr-1">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Analisando biomecânica e equipamentos disponíveis...
              </p>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="bg-slate-950 p-4 rounded-2xl text-center text-xs text-slate-400 space-y-1">
              <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
              <p>Nenhuma alternativa direta encontrada para este equipamento.</p>
            </div>
          ) : (
            alternatives.map((alt, index) => (
              <div
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      Opção {index + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                      {alt.alternativeName}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-emerald-400" />
                    {alt.requiredEquipment}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                  💡 {alt.reason}
                </p>

                <button
                  onClick={() => handleApplyAlternative(alt)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-extrabold text-xs hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                >
                  <Check className="w-4 h-4" />
                  <span>USAR ESTA ALTERNATIVA</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            A IA garante alternativas com o mesmo foco muscular e padrão de movimento.
          </p>
        </div>
      </div>
    </div>
  );
};

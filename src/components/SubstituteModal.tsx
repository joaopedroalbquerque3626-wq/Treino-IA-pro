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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] flex flex-col justify-between">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Substituição Inteligente com IA</span>
          </div>

          <h3 className="text-xl font-bold text-slate-900">Substituir Exercício</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Original: <strong className="text-slate-800">{exercise.name}</strong> ({exercise.muscleGroup})
          </p>
        </div>

        {/* Alternatives List */}
        <div className="my-6 space-y-3 overflow-y-auto max-h-[50vh] pr-1">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Analisando biomecânica e equipamentos disponíveis...
              </p>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-xs text-slate-500 space-y-1">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
              <p>Nenhuma alternativa direta encontrada para este equipamento.</p>
            </div>
          ) : (
            alternatives.map((alt, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-blue-300 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Opção {index + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {alt.alternativeName}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-blue-600" />
                    {alt.requiredEquipment}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                  💡 {alt.reason}
                </p>

                <button
                  onClick={() => handleApplyAlternative(alt)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>USAR ESTA ALTERNATIVA</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400">
            A IA garante alternativas com o mesmo foco muscular e padrão de movimento seguro.
          </p>
        </div>
      </div>
    </div>
  );
};

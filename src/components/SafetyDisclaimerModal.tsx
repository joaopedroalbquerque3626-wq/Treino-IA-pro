import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface SafetyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyDisclaimerModal: React.FC<SafetyDisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative animate-in fade-in zoom-in-95 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Diretrizes de Saúde e Segurança</h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Uso Responsável & Termos do TREINO IA PRO</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1">Aviso Médico Importante</p>
              <p className="text-xs leading-relaxed">
                O TREINO IA PRO é uma ferramenta inteligente de orientação educativa. Se você possui lesões prévias, dores articulares persistentes, hipertensão ou passou por cirurgia recente, consulte um médico e um profissional de Educação Física antes de iniciar treinos intensos.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Compromissos Éticos e Regulatórios:</h4>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Sem diagnósticos médicos:</strong> A IA atua apenas na estruturação metodológica e periodização do treino físico.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Proibição de substâncias perigosas:</strong> O aplicativo nunca recomendará anabolizantes, hormônios ou drogas de risco à saúde.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Segurança biomecânica:</strong> Em caso de dor aguda ou tontura, o treino deve ser interrompido imediatamente.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  );
};

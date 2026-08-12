import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface SafetyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyDisclaimerModal: React.FC<SafetyDisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Diretrizes de Saúde e Segurança</h3>
            <p className="text-xs text-amber-400 font-medium">Uso Responsável & Termos do TREINO IA PRO</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">Aviso Médico Importante</p>
              <p>
                O TREINO IA PRO é uma ferramenta de orientação educativa. Se você possui lesões, dores persistentes, doenças preexistentes ou passou por cirurgia recente, consulte um profissional qualificado antes de iniciar ou adaptar seu treino.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-sm">Compromissos Éticos e Regulatórios da IA:</h4>
            <ul className="space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Não realiza diagnósticos médicos:</strong> A IA não diagnostica doenças nem prescribe tratamentos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Proibição absoluta de substâncias:</strong> O aplicativo nunca recomendará anabolizantes, hormônios, medicamentos ou produtos de risco.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Sem promessas irreais:</strong> A evolução física depende de consistência, descanso e nutrição individualizada.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <p>
              Em caso de tontura, falta de ar excessiva, dor aguda nas articulações ou no peito durante a execução de qualquer exercício, interrompa imediatamente o treino e procure atendimento médico.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  );
};

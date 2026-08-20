import React, { useEffect, useRef } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface SafetyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyDisclaimerModal: React.FC<SafetyDisclaimerModalProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-title"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl relative animate-in fade-in zoom-in-95 transition-colors max-h-[90dvh] overflow-hidden"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar orientações de segurança"
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-12">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 id="safety-title" className="text-lg font-bold text-slate-900 dark:text-white">Diretrizes de Saúde e Segurança</h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Uso responsável do TREINO IA PRO</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60dvh] overflow-y-auto pr-1">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-1">Aviso importante</p>
              <p className="text-xs leading-relaxed">
                O TREINO IA PRO oferece orientação educativa e não substitui avaliação médica ou acompanhamento profissional. Em caso de dor persistente, tontura, falta de ar fora do esperado, lesão, cirurgia recente ou condição de saúde relevante, procure avaliação adequada antes de treinos intensos.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Compromissos de segurança:</h4>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Sem diagnóstico médico:</strong> a IA organiza treino e orientações gerais sem diagnosticar doenças ou lesões.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Sem substâncias de risco:</strong> o aplicativo não prescreve anabolizantes, hormônios ou medicamentos.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span><strong>Personalização funcional:</strong> treinos são adaptados por objetivo, experiência, equipamentos, tempo, preferências e limitações informadas — não por gênero.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

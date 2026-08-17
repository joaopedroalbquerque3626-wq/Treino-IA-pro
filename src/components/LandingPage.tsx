import React, { useState } from 'react';
import { Dumbbell, Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2, Target, UserCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface LandingPageProps {
  onStartQuestionnaire: () => void;
  onLoginDemo: () => void;
  onOpenSafety?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartQuestionnaire, onLoginDemo, onOpenSafety }) => {
  const [expandSafety, setExpandSafety] = useState(false);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden transition-colors">
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-12 flex-1 flex flex-col items-center text-center relative z-10 w-full">
        
        {/* TOP SAFETY & HEALTH GUIDELINES BANNER (Right at the beginning when accessing) */}
        <div className="w-full mb-6 text-left">
          <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-200/60 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                      Diretrizes de Saúde
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Uso Consciente & Segurança
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    O <strong>TREINO IA PRO</strong> prioriza a sua integridade física. Consulte um médico antes de iniciar treinos intensos.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExpandSafety(!expandSafety)}
                aria-label="Expandir detalhes de segurança"
                className="p-1.5 rounded-lg bg-amber-200/50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors shrink-0 cursor-pointer"
              >
                {expandSafety ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Expandable Safety Details */}
            {expandSafety && (
              <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800/60 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                    <strong className="block text-slate-900 dark:text-white mb-0.5">🩺 Avaliação Prévia</strong>
                    <span>Ideal para quem já tem liberação médica para atividades físicas.</span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                    <strong className="block text-slate-900 dark:text-white mb-0.5">🛡️ Sem Substâncias</strong>
                    <span>Não prescreve esteróides, remédios ou compostos de risco.</span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                    <strong className="block text-slate-900 dark:text-white mb-0.5">⚡ Respeito a Limites</strong>
                    <span>Adapte cargas em caso de fadiga excessiva ou dores anormais.</span>
                  </div>
                </div>
                {onOpenSafety && (
                  <button
                    onClick={onOpenSafety}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline pt-1 inline-block cursor-pointer"
                  >
                    Ver termo completo de responsabilidade e saúde →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Engine Badge */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 px-3.5 py-1 rounded-full text-xs font-semibold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Motor Inteligente de Treinamento com IA</span>
        </div>

        {/* Brand Name & Slogan */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          TREINO IA <span className="text-blue-600 dark:text-blue-400">PRO</span>
        </h1>
        <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-5 uppercase">
          Seu objetivo. Seu treino. Sua evolução.
        </p>

        {/* Main Title & Description */}
        <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white max-w-xl leading-snug mb-3">
          Treine com um plano feito exclusivamente para você.
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg font-normal leading-relaxed mb-8">
          Personalize seu treino por objetivo, nível, dias por semana e equipamentos da sua academia ou casa.
        </p>

        {/* Action Buttons (Mobile-first stacked on small screens) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm sm:max-w-md mb-10">
          <button
            onClick={onStartQuestionnaire}
            className="w-full sm:w-auto flex-1 min-h-[48px] px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>COMEÇAR AGORA</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onLoginDemo}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>MODO DEMO</span>
          </button>
        </div>

        {/* Feature Cards Grid (Compact & Responsive on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full max-w-3xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">100% Personalizado</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Adaptado à academia ou treino em casa, seu nível e tempo disponível por sessão.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Modo Treino no Celular</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cronômetro de descanso, registro fácil de cargas, repetições e substituições por IA.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Segurança em 1º Lugar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Triagem de lesões e restrições biomecânicas. Progressão de carga consciente.
            </p>
          </div>
        </div>

        {/* Benefits checklist (Compact pill list) */}
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 max-w-2xl w-full grid grid-cols-2 gap-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Divisão semanal por IA</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Timer de descanso</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Evolução de cargas</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Assistente IA 24h</span>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer Notice */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-3xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            TREINO IA PRO © 2026 — Ferramenta inteligente de periodização física.
          </p>
          <p>
            Não substitui acompanhamento médico ou de Educação Física. Em caso de dores, pare e procure um especialista.
          </p>
        </div>
      </footer>
    </div>
  );
};

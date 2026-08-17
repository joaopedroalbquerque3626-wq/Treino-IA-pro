import React from 'react';
import { Dumbbell, Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2, Target, UserCheck } from 'lucide-react';

interface LandingPageProps {
  onStartQuestionnaire: () => void;
  onLoginDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartQuestionnaire, onLoginDemo }) => {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden transition-colors">
      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-20 flex-1 flex flex-col items-center text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Motor Inteligente de Treinamento Físico com IA</span>
        </div>

        {/* Brand Name & Slogan */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
          TREINO IA <span className="text-blue-600 dark:text-blue-400">PRO</span>
        </h1>
        <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 tracking-wide mb-8 uppercase">
          Seu objetivo. Seu treino. Sua evolução.
        </p>

        {/* Main Title & Description */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white max-w-2xl leading-tight mb-4">
          Treine com um plano criado para você.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mb-10">
          Informe seu objetivo, experiência, disponibilidade e equipamentos. A IA organiza uma rotina de treinamento adaptada ao seu perfil.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16">
          <button
            onClick={onStartQuestionnaire}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>COMEÇAR AGORA</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onLoginDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>ENTRAR</span>
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left w-full max-w-4xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">100% Personalizado</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Respeita seus equipamentos, local (academia ou casa), nível atual e restrições de tempo por sessão.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Modo Treino Ativo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cronômetro de descanso automático, registro rápido de cargas, repetições concluídas e substituição inteligente de exercícios.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Segurança em 1º Lugar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Checkup preventivo de lesões e restrições físicas. Sem receitas genéricas ou substâncias perigosas.
            </p>
          </div>
        </div>

        {/* Benefits checklist */}
        <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-3xl w-full flex flex-wrap justify-around gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Divisão semanal inteligente</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Timer de descanso integrado</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Gráficos de evolução de carga</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Assistente IA 24h em Português</span>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer Notice */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            TREINO IA PRO © 2026 — Ferramenta educativa e de orientação de treinamento.
          </p>
          <p>
            Não substitui avaliação médica nem acompanhamento de um profissional de Educação Física. Em caso de dores ou lesões, consulte um especialista.
          </p>
        </div>
      </footer>
    </div>
  );
};

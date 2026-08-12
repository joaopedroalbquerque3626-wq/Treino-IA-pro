import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, HelpCircle, Dumbbell } from 'lucide-react';
import { UserProfile, WorkoutPlan, AIChatMessage } from '../types';
import { fetchAIChatResponse } from '../services/workoutEngine';

interface AICoachChatProps {
  profile: UserProfile;
  currentPlan: WorkoutPlan | null;
}

export const AICoachChat: React.FC<AICoachChatProps> = ({ profile, currentPlan }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Olá ${profile.name}! Sou o **ASSISTENTE TREINO IA**, seu coach inteligente. 🤖\n\nEstou integrado ao seu perfil de **${profile.objective}** (${profile.experience}) para tirar dúvidas sobre a execução dos exercícios, descansos, cargas e substituições. Como posso te ajudar hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Qual é meu treino hoje?',
    'Qual exercício vem depois?',
    'Posso substituir esse exercício?',
    'Como faço esse exercício?',
    'Quanto descanso devo fazer?',
    'Como está minha evolução?',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const replyText = await fetchAIChatResponse(text, profile, currentPlan || undefined);
      const assistantMsg: AIChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 animate-in fade-in pb-28">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
              IA INTEGRADA AO PLANO ATIVO
            </span>
            <h1 className="text-xl font-black text-white mt-1">ASSISTENTE TREINO IA</h1>
          </div>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Perguntas Frequentes do Atleta:
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer"
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MESSAGES DISPLAY */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 min-h-[450px] max-h-[600px] flex flex-col justify-between shadow-2xl">
        <div className="space-y-4 overflow-y-auto pr-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-500 text-slate-950 font-bold rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      isUser ? 'text-slate-900/70 font-semibold text-right' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 mt-1">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 bg-slate-950 p-3 rounded-2xl border border-slate-800 w-fit">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>ASSISTENTE TREINO IA está analisando seu perfil...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-4 pt-3 border-t border-slate-800/80 flex gap-2"
        >
          <input
            type="text"
            placeholder="Digite sua dúvida sobre o treino, exercícios ou descanso..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black text-xs hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

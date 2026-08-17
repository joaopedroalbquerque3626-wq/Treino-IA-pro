import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, MessageSquare } from 'lucide-react';
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
      text: `Olá ${profile.name}! Sou o **ASSISTENTE TREINO IA**, seu consultor inteligente de treinamento. 🤖\n\nEstou sincronizado com o seu plano de **${profile.objective}** (${profile.experience}) para tirar dúvidas sobre biomecânica, descanso entre séries, progressão de carga e substituições. Como posso te ajudar hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Qual é meu treino de hoje?',
    'Como progredir a carga com segurança?',
    'Posso substituir algum exercício?',
    'Quanto tempo de descanso devo fazer?',
    'Dicas para melhorar minha recuperação?',
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in pb-28">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>IA Sincronizada ao seu Plano</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Assistente TREINO IA
            </h1>
            <p className="text-xs text-slate-500">
              Pergunte sobre exercícios, execução, cargas e rotina.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            🎯 {profile.objective}
          </span>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Perguntas Frequentes:
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-sm"
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 min-h-[480px] max-h-[620px] flex flex-col justify-between shadow-sm">
        <div className="space-y-4 overflow-y-auto pr-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 ${
                      isUser ? 'text-blue-100 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 mt-1 text-xs">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-2xl border border-blue-100 w-fit">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>O Assistente IA está analisando seu perfil...</span>
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
          className="mt-4 pt-4 border-t border-slate-200 flex gap-2"
        >
          <input
            type="text"
            placeholder="Digite sua dúvida sobre treinos, cargas ou descanso..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

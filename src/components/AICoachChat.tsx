import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { AIChatMessage, UserProfile, WorkoutPlan } from '../types';
import { fetchAIChatResponse } from '../services/workoutEngine';

interface AICoachChatProps {
  profile: UserProfile;
  currentPlan?: WorkoutPlan | null;
  workoutPlan?: WorkoutPlan | null;
  messages?: AIChatMessage[];
  onSendMessage?: (text: string) => void;
  isLoading?: boolean;
}

export const AICoachChat: React.FC<AICoachChatProps> = ({
  profile,
  currentPlan,
  workoutPlan,
  messages: externalMessages,
  onSendMessage: externalOnSendMessage,
  isLoading: externalIsLoading,
}) => {
  const plan = currentPlan || workoutPlan || null;

  const [internalMessages, setInternalMessages] = useState<AIChatMessage[]>(() => [
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Olá, ${profile.name}! Sou o seu IA Coach de Treinamento. Posso te ajudar com execução de exercícios, sugestões de cargas, substituições para máquinas ocupadas e dicas para seu objetivo de ${profile.objective}. Como posso te ajudar hoje?`,
      timestamp: 'Agora',
    },
  ]);

  const [internalLoading, setInternalLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = externalMessages || internalMessages;
  const activeLoading = externalIsLoading !== undefined ? externalIsLoading : internalLoading;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, activeLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || activeLoading) return;

    if (externalOnSendMessage) {
      externalOnSendMessage(textToSend);
      return;
    }

    const userMsg: AIChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInternalMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setInternalLoading(true);

    try {
      const aiReplyText = await fetchAIChatResponse(textToSend, profile, plan || undefined);
      const aiMsg: AIChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setInternalMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: AIChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Não consegui processar a resposta no momento. Pode tentar novamente?',
        timestamp: 'Agora',
      };
      setInternalMessages((prev) => [...prev, errMsg]);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const quickPrompts = [
    'Como progredir a carga com segurança?',
    'Posso trocar agachamento por leg press?',
    'O que comer antes e depois do treino?',
    'Sinto desconforto no ombro ao desenvolver.',
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col h-[calc(100dvh-140px)] sm:h-[calc(100vh-140px)] animate-in fade-in">
      {/* Header section */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                IA Coach de Treinamento
              </h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              Dúvidas biomecânicas, execuções e dicas 24h
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 scrollbar-none">
        {activeMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-blue-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 sm:p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[9px] block mt-1.5 ${
                    isUser ? 'text-blue-200 text-right' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {activeLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shadow-xs">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span>O IA Coach está digitando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions (Smooth horizontal scrolling on mobile) */}
      <div className="py-2 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0 -mx-1 px-1">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs active:scale-95"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSubmit} className="pt-2 shrink-0">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xs focus-within:border-blue-600 transition-colors">
          <input
            type="text"
            placeholder="Pergunte sobre exercícios, execução ou cargas..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={activeLoading}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || activeLoading}
            aria-label="Enviar mensagem"
            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

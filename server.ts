import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily/safely
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'TREINO IA PRO' });
  });

  // 1. Generate Plan API Endpoint
  app.post('/api/generate-plan', async (req, res) => {
    try {
      const { profile } = req.body;
      if (!profile) {
        return res.status(400).json({ error: 'Perfil de usuário é obrigatório' });
      }

      const ai = getGenAI();
      if (!ai) {
        console.log('GEMINI_API_KEY not configured, returning empty for client fallback');
        return res.status(503).json({ error: 'Gemini API não configurada' });
      }

      const prompt = `Você é o personal trainer e especialista em ciência do esporte do aplicativo TREINO IA PRO.
Crie um plano de treino altamente personalizado e realista em formato JSON para o seguinte perfil de usuário:

Nome: ${profile.name}
Idade: ${profile.age} anos
Altura: ${profile.height} cm
Peso: ${profile.weight} kg
Objetivo: ${profile.objective}
Nível de experiência: ${profile.experience}
Local de treino: ${profile.location}
Equipamentos disponíveis: ${profile.equipment?.join(', ') || 'Apenas peso corporal'}
Dias disponíveis por semana: ${profile.daysPerWeek} dias
Tempo por sessão: ${profile.sessionTimeMin} minutos
Exercícios preferidos: ${profile.preferredExercises || 'Nenhum'}
Exercícios a evitar: ${profile.avoidExercises || 'Nenhum'}
Observações / Restrições: ${profile.observations || 'Nenhuma'}

REGRAS RÍGIDAS DE SEGURANÇA E QUALIDADE:
1. NUNCA prescreva anabolizantes, hormônios, medicamentos ou substâncias perigosas.
2. NUNCA crie exercícios que exijam equipamentos que o usuário NÃO possui.
3. Se o usuário relatou dor, lesão ou cirurgia recente, adote postura preventiva e inclua avisos de segurança.
4. A divisão semanal deve corresponder exatamente à quantidade de dias por semana (${profile.daysPerWeek} dias).
5. Defina aquecimento (warmup) rápido e funcional para cada sessão.
6. Ajuste o número de séries, repetições e descansos adequadamente para o nível (${profile.experience}) e objetivo (${profile.objective}).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              createdAt: { type: Type.STRING },
              updatedAt: { type: Type.STRING },
              summary: {
                type: Type.OBJECT,
                properties: {
                  objective: { type: Type.STRING },
                  experience: { type: Type.STRING },
                  daysPerWeek: { type: Type.INTEGER },
                  sessionTimeMin: { type: Type.INTEGER },
                  location: { type: Type.STRING },
                  equipment: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['objective', 'experience', 'daysPerWeek', 'sessionTimeMin', 'location'],
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    dayNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    isRestDay: { type: Type.BOOLEAN },
                    targetGoal: { type: Type.STRING },
                    estimatedDuration: { type: Type.STRING },
                    warmup: { type: Type.STRING },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          muscleGroup: { type: Type.STRING },
                          sets: { type: Type.INTEGER },
                          reps: { type: Type.STRING },
                          restSeconds: { type: Type.INTEGER },
                          executionTip: { type: Type.STRING },
                          equipment: { type: Type.STRING },
                        },
                        required: ['id', 'name', 'muscleGroup', 'sets', 'reps', 'restSeconds', 'executionTip', 'equipment'],
                      },
                    },
                  },
                  required: ['id', 'dayNumber', 'title', 'isRestDay', 'targetGoal', 'estimatedDuration', 'warmup', 'exercises'],
                },
              },
              aiAnalysisNotes: { type: Type.STRING },
            },
            required: ['id', 'summary', 'days', 'aiAnalysisNotes'],
          },
        },
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error('Nenhuma resposta do Gemini');
      }

      const workoutPlan = JSON.parse(jsonText);
      return res.json(workoutPlan);
    } catch (error: any) {
      console.error('Erro na rota /api/generate-plan:', error);
      res.status(500).json({ error: error.message || 'Erro ao gerar plano via IA' });
    }
  });

  // 2. Substitute Exercise API Endpoint
  app.post('/api/substitute-exercise', async (req, res) => {
    try {
      const { exercise, profile } = req.body;
      const ai = getGenAI();
      if (!ai) {
        return res.status(530).json({ error: 'Gemini indisponível' });
      }

      const prompt = `Você é o assistente técnico do TREINO IA PRO. O usuário quer substituir o exercício: "${exercise.name}" (${exercise.muscleGroup}, equipamento: ${exercise.equipment}).

Perfil do usuário:
- Equipamentos disponíveis: ${profile.equipment?.join(', ') || 'Peso Corporal'}
- Nível de experiência: ${profile.experience}
- Local: ${profile.location}

Forneça até 3 alternativas viáveis que respeitem estritamente os equipamentos que o usuário possui.
Explique o motivo pedagógico de cada substituição.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalName: { type: Type.STRING },
                    alternativeName: { type: Type.STRING },
                    muscleGroup: { type: Type.STRING },
                    requiredEquipment: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                  required: ['originalName', 'alternativeName', 'muscleGroup', 'requiredEquipment', 'reason'],
                },
              },
            },
            required: ['alternatives'],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (err: any) {
      console.error('Erro em /api/substitute-exercise:', err);
      res.status(500).json({ error: 'Erro ao buscar alternativas' });
    }
  });

  // 3. AI Coach Chat Endpoint
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message, profile, currentPlan } = req.body;
      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({ error: 'IA indisponível' });
      }

      const systemInstruction = `Você é o ASSISTENTE TREINO IA, o coach inteligente e motivador do aplicativo TREINO IA PRO.
Você responde perguntas sobre o plano de treino do usuário, dicas de execução, nutrição esportiva básica, descanso e segurança.

Dados do usuário atual:
- Nome: ${profile?.name || 'Atleta'}
- Objetivo: ${profile?.objective || 'Geral'}
- Nível: ${profile?.experience || 'Iniciante'}
- Local de treino: ${profile?.location || 'Academia'}
- Equipamentos: ${profile?.equipment?.join(', ') || 'Geral'}

Suas respostas devem ser claras, objetivas, amigáveis e estruturadas em Markdown.
Mantenha um tom profissional, educativo e encorajador.
NUNCA prescreva substâncias ilícitas, anabolizantes ou diagnósticos médicos.`;

      const prompt = `Pergunta do usuário: "${message}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Erro em /api/ai-chat:', err);
      res.status(500).json({ error: 'Erro no assistente de IA' });
    }
  });

  // Serve Vite app
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur TREINO IA PRO rodando na porta ${PORT}`);
  });
}

startServer();

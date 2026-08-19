import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_SIZE = '256kb';
const MAX_MESSAGE_LENGTH = 4000;
const MAX_PROFILE_FIELD_LENGTH = 500;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

type RateEntry = { count: number; resetAt: number };
const rateStore = new Map<string, RateEntry>();
const normalize = (value: unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const text = (value: unknown, max = MAX_PROFILE_FIELD_LENGTH) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const numberInRange = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

const equipmentGroups = [
  ['halter', 'halteres', 'dumbbell', 'dumbbells'], ['anilha', 'anilhas', 'plate', 'plates'], ['barra', 'barbell'],
  ['banco', 'bench'], ['maquina', 'maquinas', 'machine', 'machines'], ['barra fixa', 'pull up', 'pull-up'],
  ['polia', 'cabo', 'crossover'], ['elastico', 'band', 'bands'], ['peso corporal', 'corpo', 'bodyweight'],
];

function equipmentAllowed(requiredEquipment: string, available: string[] = []) {
  const req = normalize(requiredEquipment);
  if (!req || req.includes('peso corporal') || req.includes('corpo')) return true;
  const availableText = available.map(normalize).join(' | ');
  if (availableText.includes('todas as maquinas') || availableText.includes('maquinas de academia')) return true;
  const requiredGroups = equipmentGroups.filter(group => group.some(alias => req.includes(normalize(alias))));
  if (!requiredGroups.length) return available.some(item => {
    const current = normalize(item); return current.includes(req) || req.includes(current);
  });
  return requiredGroups.every(group => group.some(alias => availableText.includes(normalize(alias))));
}

function validateProfile(profile: any) {
  if (!profile || typeof profile !== 'object') return 'Perfil de usuário é obrigatório.';
  if (!numberInRange(profile.age, 10, 100)) return 'Idade inválida.';
  if (!numberInRange(profile.height, 80, 250)) return 'Altura inválida.';
  if (!numberInRange(profile.weight, 25, 350)) return 'Peso inválido.';
  if (!Number.isInteger(profile.daysPerWeek) || profile.daysPerWeek < 1 || profile.daysPerWeek > 7) return 'Dias por semana inválidos.';
  if (!numberInRange(profile.sessionTimeMin, 15, 240)) return 'Tempo de sessão inválido.';
  if (!Array.isArray(profile.equipment) || profile.equipment.length > 30) return 'Equipamentos inválidos.';
  return null;
}

function validateWorkoutPlan(plan: any, profile: any) {
  if (!plan || typeof plan !== 'object' || !Array.isArray(plan.days)) return 'A IA retornou um plano inválido.';
  if (plan.days.length !== profile.daysPerWeek) return `O plano deve conter exatamente ${profile.daysPerWeek} dias.`;
  for (const day of plan.days) {
    if (!day || typeof day !== 'object' || !Array.isArray(day.exercises)) return 'Um dos dias do plano está inválido.';
    if (day.exercises.length > 30) return 'Plano excedeu o limite de exercícios.';
    for (const exercise of day.exercises) {
      if (!exercise?.name || !exercise?.equipment) return 'Existe exercício sem dados obrigatórios.';
      if (!equipmentAllowed(String(exercise.equipment), profile.equipment)) return `Exercício incompatível com os equipamentos disponíveis: ${exercise.name}.`;
      if (!Number.isInteger(exercise.sets) || exercise.sets < 1 || exercise.sets > 10) return `Séries inválidas em ${exercise.name}.`;
      if (!Number.isInteger(exercise.restSeconds) || exercise.restSeconds < 0 || exercise.restSeconds > 600) return `Descanso inválido em ${exercise.name}.`;
    }
  }
  return null;
}

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip || 'unknown'; const now = Date.now(); const current = rateStore.get(key);
  if (!current || current.resetAt <= now) { rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS }); return next(); }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return res.status(429).json({ error: 'Muitas solicitações. Tente novamente em alguns segundos.' });
  current.count += 1; return next();
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: MAX_BODY_SIZE }));
  app.use('/api', rateLimit);
  const getGenAI = () => { const apiKey = process.env.GEMINI_API_KEY; return apiKey ? new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } }) : null; };

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'TREINO IA PRO' }));

  app.post('/api/generate-plan', async (req, res) => {
    try {
      const { profile } = req.body || {}; const validationError = validateProfile(profile);
      if (validationError) return res.status(400).json({ error: validationError });
      const ai = getGenAI(); if (!ai) return res.status(503).json({ error: 'Gemini API não configurada' });
      const prompt = `Você é o personal trainer e especialista em ciência do esporte do aplicativo TREINO IA PRO. Crie um plano de treino personalizado em JSON.
PERFIL: Nome: ${text(profile.name, 100)} | Idade: ${profile.age} | Altura: ${profile.height} cm | Peso: ${profile.weight} kg | Objetivo: ${text(profile.objective, 100)} | Experiência: ${text(profile.experience, 100)} | Local: ${text(profile.location, 100)} | Equipamentos: ${profile.equipment.join(', ') || 'Apenas peso corporal'} | Dias: ${profile.daysPerWeek} | Tempo: ${profile.sessionTimeMin} min | Preferências: ${text(profile.preferredExercises)} | Evitar: ${text(profile.avoidExercises)} | Observações: ${text(profile.observations)}
REGRAS: nunca prescreva anabolizantes, hormônios ou medicamentos; use somente equipamentos disponíveis ou peso corporal; seja conservador diante de dor/lesão/cirurgia; retorne exatamente ${profile.daysPerWeek} dias; respeite aproximadamente ${profile.sessionTimeMin} minutos; não invente dados clínicos.`;
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt, config: {
        responseMimeType: 'application/json',
        responseSchema: { type: Type.OBJECT, properties: {
          id: { type: Type.STRING }, createdAt: { type: Type.STRING }, updatedAt: { type: Type.STRING },
          summary: { type: Type.OBJECT, properties: { objective: { type: Type.STRING }, experience: { type: Type.STRING }, daysPerWeek: { type: Type.INTEGER }, sessionTimeMin: { type: Type.INTEGER }, location: { type: Type.STRING }, equipment: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['objective', 'experience', 'daysPerWeek', 'sessionTimeMin', 'location'] },
          days: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, dayNumber: { type: Type.INTEGER }, title: { type: Type.STRING }, isRestDay: { type: Type.BOOLEAN }, targetGoal: { type: Type.STRING }, estimatedDuration: { type: Type.STRING }, warmup: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, muscleGroup: { type: Type.STRING }, sets: { type: Type.INTEGER }, reps: { type: Type.STRING }, restSeconds: { type: Type.INTEGER }, executionTip: { type: Type.STRING }, equipment: { type: Type.STRING } }, required: ['id', 'name', 'muscleGroup', 'sets', 'reps', 'restSeconds', 'executionTip', 'equipment'] } } }, required: ['id', 'dayNumber', 'title', 'isRestDay', 'targetGoal', 'estimatedDuration', 'warmup', 'exercises'] } },
          aiAnalysisNotes: { type: Type.STRING },
        }, required: ['id', 'summary', 'days', 'aiAnalysisNotes'] },
      }});
      const jsonText = response.text; if (!jsonText) throw new Error('Nenhuma resposta do Gemini');
      const workoutPlan = JSON.parse(jsonText); const planError = validateWorkoutPlan(workoutPlan, profile);
      if (planError) return res.status(422).json({ error: planError, code: 'INVALID_AI_PLAN' });
      return res.json(workoutPlan);
    } catch (error) { console.error('Erro na geração do plano:', error); return res.status(500).json({ error: 'Não foi possível gerar o plano agora.' }); }
  });

  app.post('/api/tweak-plan', async (req, res) => {
    try {
      const { plan, prompt, profile } = req.body || {};
      const profileError = validateProfile(profile); if (profileError) return res.status(400).json({ error: profileError });
      if (!plan || typeof plan !== 'object' || !text(prompt, 2000)) return res.status(400).json({ error: 'Plano ou instrução inválida.' });
      const ai = getGenAI(); if (!ai) return res.status(503).json({ error: 'Gemini API não configurada' });
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: `Ajuste o plano abaixo conforme a instrução. Preserve exatamente ${profile.daysPerWeek} dias e os equipamentos disponíveis. Não remova segurança. INSTRUÇÃO: ${text(prompt, 2000)} PERFIL: ${JSON.stringify(profile).slice(0, 8000)} PLANO: ${JSON.stringify(plan).slice(0, 30000)}`, config: { responseMimeType: 'application/json' } });
      const updatedPlan = JSON.parse(response.text || '{}'); const planError = validateWorkoutPlan(updatedPlan, profile);
      if (planError) return res.status(422).json({ error: planError, code: 'INVALID_TWEAKED_PLAN' });
      return res.json({ plan: updatedPlan });
    } catch (error) { console.error('Erro ao ajustar plano:', error); return res.status(500).json({ error: 'Não foi possível ajustar o plano agora.' }); }
  });

  app.post('/api/substitute-exercise', async (req, res) => {
    try {
      const { exercise, profile } = req.body || {}; const profileError = validateProfile(profile);
      if (profileError || !exercise?.name || !exercise?.muscleGroup) return res.status(400).json({ error: profileError || 'Exercício inválido.' });
      const ai = getGenAI(); if (!ai) return res.status(503).json({ error: 'Gemini indisponível' });
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: `Substitua o exercício "${text(exercise.name, 150)}" (${text(exercise.muscleGroup, 100)}). Equipamentos disponíveis: ${profile.equipment.join(', ') || 'Peso corporal'}. Forneça até 3 alternativas, usando somente equipamento disponível ou peso corporal.`, config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { alternatives: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { originalName: { type: Type.STRING }, alternativeName: { type: Type.STRING }, muscleGroup: { type: Type.STRING }, requiredEquipment: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['originalName', 'alternativeName', 'muscleGroup', 'requiredEquipment', 'reason'] } } }, required: ['alternatives'] } } });
      const result = JSON.parse(response.text || '{}'); result.alternatives = Array.isArray(result.alternatives) ? result.alternatives.filter((item: any) => equipmentAllowed(String(item.requiredEquipment || ''), profile.equipment)).slice(0, 3) : []; return res.json(result);
    } catch (error) { console.error('Erro na substituição:', error); return res.status(500).json({ error: 'Erro ao buscar alternativas' }); }
  });

  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message, profile, currentPlan } = req.body || {}; const profileError = validateProfile(profile);
      if (profileError) return res.status(400).json({ error: profileError });
      const cleanMessage = text(message, MAX_MESSAGE_LENGTH); if (!cleanMessage) return res.status(400).json({ error: 'Mensagem vazia.' });
      const ai = getGenAI(); if (!ai) return res.status(503).json({ error: 'IA indisponível' });
      const safePlan = currentPlan ? JSON.stringify(currentPlan).slice(0, 30000) : 'Nenhum plano carregado.';
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: `Pergunta do usuário: "${cleanMessage}"`, config: { systemInstruction: `Você é o ASSISTENTE TREINO IA PRO. Responda sobre treino, execução, descanso, nutrição esportiva básica e segurança. Perfil: ${text(profile.name, 100)} | Objetivo: ${text(profile.objective, 100)} | Nível: ${text(profile.experience, 100)} | Equipamentos: ${profile.equipment.join(', ')}. Plano atual: ${safePlan}. Se houver dor/lesão, não diagnostique e recomende avaliação profissional. Nunca prescreva anabolizantes ou medicamentos.`, temperature: 0.7 } });
      return res.json({ text: response.text || 'Não consegui gerar uma resposta agora.' });
    } catch (error) { console.error('Erro no assistente:', error); return res.status(500).json({ error: 'Erro no assistente de IA' }); }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' }); app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist'); app.use(express.static(distPath)); app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Servidor TREINO IA PRO rodando na porta ${PORT}`));
}
startServer();

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
  if (plan.days.length !== profile.daysPerWeek) return `O plano deve conter exatamente ${profile.daysPerWeek} dias de treino.`;
  for (const day of plan.days) {
    if (!day || typeof day !== 'object' || !Array.isArray(day.exercises)) return 'Um dos dias do plano está inválido.';
    if (day.isRestDay) return 'Dias de descanso não podem ocupar um dos dias de treino escolhidos pelo usuário.';
    if (!day.exercises.length) return 'Um dia de treino não pode estar vazio.';
    if (day.exercises.length > 30) return 'Plano excedeu o limite de exercícios.';
    for (const exercise of day.exercises) {
      if (!exercise?.name || !exercise?.equipment || !exercise?.muscleGroup) return 'Existe exercício sem dados obrigatórios.';
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

const workoutPlanSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    createdAt: { type: Type.STRING },
    updatedAt: { type: Type.STRING },
    summary: {
      type: Type.OBJECT,
      properties: {
        objective: { type: Type.STRING }, experience: { type: Type.STRING }, daysPerWeek: { type: Type.INTEGER },
        sessionTimeMin: { type: Type.INTEGER }, location: { type: Type.STRING }, equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['objective', 'experience', 'daysPerWeek', 'sessionTimeMin', 'location', 'equipment'],
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING }, dayNumber: { type: Type.INTEGER }, title: { type: Type.STRING }, isRestDay: { type: Type.BOOLEAN },
          targetGoal: { type: Type.STRING }, estimatedDuration: { type: Type.STRING }, warmup: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING }, name: { type: Type.STRING }, muscleGroup: { type: Type.STRING }, sets: { type: Type.INTEGER },
                reps: { type: Type.STRING }, restSeconds: { type: Type.INTEGER }, executionTip: { type: Type.STRING }, equipment: { type: Type.STRING },
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
};

function healthContext(profile: any) {
  const health = profile?.healthSafety || {};
  return [
    `Lesões: ${text(health.injuries) || 'não informado'}`,
    `Dor persistente: ${text(health.persistentPain) || 'não informado'}`,
    `Doenças/condições: ${text(health.diseases) || 'não informado'}`,
    `Cirurgias recentes: ${text(health.recentSurgeries) || 'não informado'}`,
    `Limitações físicas: ${text(health.physicalLimitations) || 'não informado'}`,
    `Sintomas durante exercício: ${text(health.exerciseSymptoms) || 'não informado'}`,
  ].join(' | ');
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

      const prompt = `Você é o motor de prescrição de treino do TREINO IA PRO. Sua tarefa é gerar um plano coerente, executável e personalizado. Retorne somente o JSON exigido pelo schema.

<DADOS_DO_USUARIO>
Nome: ${text(profile.name, 100)}
Idade: ${profile.age}
Altura: ${profile.height} cm
Peso: ${profile.weight} kg
Objetivo: ${text(profile.objective, 100)}
Experiência: ${text(profile.experience, 100)}
Local: ${text(profile.location, 100)}
Equipamentos disponíveis: ${profile.equipment.join(', ') || 'apenas peso corporal'}
Dias de treino por semana: ${profile.daysPerWeek}
Tempo máximo aproximado por sessão: ${profile.sessionTimeMin} min
Exercícios preferidos: ${text(profile.preferredExercises) || 'nenhum informado'}
Exercícios a evitar: ${text(profile.avoidExercises) || 'nenhum informado'}
Observações: ${text(profile.observations) || 'nenhuma'}
Segurança/saúde: ${healthContext(profile)}
</DADOS_DO_USUARIO>

<REGRAS_OBRIGATORIAS>
1. Gere EXATAMENTE ${profile.daysPerWeek} dias de TREINO. Não inclua dias de descanso dentro desse total. Todos os itens de days devem ter isRestDay=false.
2. Cada dia deve possuir pelo menos 2 exercícios válidos e compatíveis com o local/equipamentos, salvo se uma limitação de saúde tornar isso inadequado; nesse caso, mantenha segurança e explique em aiAnalysisNotes.
3. Use SOMENTE equipamentos informados pelo usuário ou peso corporal. Se um exercício exige dois equipamentos, ambos precisam estar disponíveis.
4. Nunca use um exercício listado em "Exercícios a evitar". Dê prioridade aos preferidos quando forem compatíveis e adequados.
5. A duração estimada deve ser plausível para ${profile.sessionTimeMin} minutos, considerando aquecimento, séries, execução e descansos. Reduza a quantidade de exercícios antes de ultrapassar muito o tempo.
6. Ajuste volume, repetições e descanso ao objetivo e à experiência. Evite volume excessivo para iniciantes.
7. Não invente lesões, diagnósticos, cargas, percentuais de gordura, histórico clínico ou qualquer dado que o usuário não forneceu.
8. Se houver dor persistente, cirurgia recente, sintomas durante exercício ou limitação relevante, adote abordagem conservadora e registre recomendação de avaliação profissional em aiAnalysisNotes. Não faça diagnóstico.
9. Nunca prescreva anabolizantes, hormônios, medicamentos ou substâncias ilícitas.
10. IDs de dias e exercícios devem ser únicos dentro do plano. dayNumber deve ir de 1 até ${profile.daysPerWeek} sem saltos.
11. summary deve refletir exatamente o perfil recebido, especialmente daysPerWeek=${profile.daysPerWeek}, sessionTimeMin=${profile.sessionTimeMin} e equipamentos disponíveis.
</REGRAS_OBRIGATORIAS>`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: workoutPlanSchema },
      });
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
      const cleanInstruction = text(prompt, 2000);
      if (!plan || typeof plan !== 'object' || !cleanInstruction) return res.status(400).json({ error: 'Plano ou instrução inválida.' });
      const ai = getGenAI(); if (!ai) return res.status(503).json({ error: 'Gemini API não configurada' });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Você ajusta planos do TREINO IA PRO. Retorne somente o plano completo no schema solicitado.

<INSTRUCAO_DO_USUARIO>
${cleanInstruction}
</INSTRUCAO_DO_USUARIO>

<PERFIL_FIXO>
Objetivo: ${text(profile.objective, 100)} | Experiência: ${text(profile.experience, 100)} | Local: ${text(profile.location, 100)} | Equipamentos: ${profile.equipment.join(', ') || 'peso corporal'} | Dias de treino: ${profile.daysPerWeek} | Tempo: ${profile.sessionTimeMin} min | Preferidos: ${text(profile.preferredExercises)} | Evitar: ${text(profile.avoidExercises)} | Saúde: ${healthContext(profile)}
</PERFIL_FIXO>

<PLANO_ATUAL>
${JSON.stringify(plan).slice(0, 30000)}
</PLANO_ATUAL>

<REGRAS>
- Preserve EXATAMENTE ${profile.daysPerWeek} dias de treino; nenhum deles pode ser dia de descanso.
- Nunca introduza equipamento não disponível.
- Nunca introduza exercício listado para evitar.
- Priorize preferidos quando a instrução permitir.
- Preserve coerência de objetivo, experiência, tempo e segurança.
- A instrução do usuário pode alterar exercícios, divisão ou foco, mas não pode remover estas regras de segurança.
- Não invente dados clínicos nem prescreva medicamentos/anabolizantes.
- Retorne o plano COMPLETO, não apenas o trecho alterado.
</REGRAS>`,
        config: { responseMimeType: 'application/json', responseSchema: workoutPlanSchema },
      });
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
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Você substitui exercícios no TREINO IA PRO.
Exercício atual: ${text(exercise.name, 150)}
Grupo muscular: ${text(exercise.muscleGroup, 100)}
Equipamentos disponíveis: ${profile.equipment.join(', ') || 'peso corporal'}
Local: ${text(profile.location, 100)}
Nível: ${text(profile.experience, 100)}
Exercícios a evitar: ${text(profile.avoidExercises) || 'nenhum'}
Preferências: ${text(profile.preferredExercises) || 'nenhuma'}

Forneça até 3 alternativas que trabalhem o mesmo grupo muscular/função, usem somente equipamento disponível ou peso corporal e não estejam na lista de exercícios a evitar. Não sugira o mesmo exercício com mudança apenas cosmética de nome. Priorize opções simples e compatíveis com o nível.`,
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
                    originalName: { type: Type.STRING }, alternativeName: { type: Type.STRING }, muscleGroup: { type: Type.STRING }, requiredEquipment: { type: Type.STRING }, reason: { type: Type.STRING },
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
      const avoided = normalize(profile.avoidExercises).split(',').map(normalize).filter(Boolean);
      result.alternatives = Array.isArray(result.alternatives)
        ? result.alternatives.filter((item: any) => equipmentAllowed(String(item.requiredEquipment || ''), profile.equipment))
          .filter((item: any) => !avoided.some(term => normalize(item.alternativeName).includes(term)))
          .filter((item: any) => normalize(item.alternativeName) !== normalize(exercise.name))
          .slice(0, 3)
        : [];
      return res.json(result);
    } catch (error) { console.error('Erro na substituição:', error); return res.status(500).json({ error: 'Erro ao buscar alternativas' }); }
  });

  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message, profile, currentPlan } = req.body || {}; const profileError = validateProfile(profile);
      if (profileError) return res.status(400).json({ error: profileError });
      const cleanMessage = text(message, MAX_MESSAGE_LENGTH); if (!cleanMessage) return res.status(400).json({ error: 'Mensagem vazia.' });
      const ai = getGenAI(); if (!ai) return res.status(503).json({ error: 'IA indisponível' });
      const safePlan = currentPlan ? JSON.stringify(currentPlan).slice(0, 30000) : 'Nenhum plano carregado.';
      const systemInstruction = `Você é o ASSISTENTE TREINO IA PRO. Responda em português do Brasil, de forma objetiva e contextualizada.

PERFIL: ${text(profile.name, 100)} | Objetivo: ${text(profile.objective, 100)} | Nível: ${text(profile.experience, 100)} | Local: ${text(profile.location, 100)} | Equipamentos: ${profile.equipment.join(', ')} | Saúde: ${healthContext(profile)}
PLANO ATUAL: ${safePlan}

REGRAS: use o plano atual quando a pergunta se referir ao treino do usuário; não invente histórico, carga ou condição clínica; não diagnostique lesões/doenças; diante de dor persistente, sintomas ou cirurgia recente, seja conservador e recomende avaliação profissional quando apropriado; não prescreva medicamentos, hormônios ou anabolizantes; não afirme que alterações foram salvas no aplicativo se você apenas respondeu em texto.`;
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: `Pergunta do usuário: ${cleanMessage}`, config: { systemInstruction, temperature: 0.6 } });
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

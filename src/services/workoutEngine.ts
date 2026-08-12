import {
  UserProfile,
  WorkoutPlan,
  WorkoutDay,
  Exercise,
  ExerciseAlternative,
  ProgressionSuggestion,
  CompletedSession,
} from '../types';

// Default exercise library by muscle group and equipment
const EXERCISE_LIBRARY: Record<string, { name: string; equipment: string; tip: string }[]> = {
  Peito: [
    { name: 'Supino Reto', equipment: 'Anilhas e Halteres', tip: 'Mantenha as escápulas retráídas e cotovelos em 45°.' },
    { name: 'Supino Inclinado com Halteres', equipment: 'Banco Inclinável', tip: 'Foque no peitoral superior mantendo tronco estável.' },
    { name: 'Flexão de Braços', equipment: 'Peso Corporal', tip: 'Corpo alinhado em prancha do pescoço ao calcanhar.' },
    { name: 'Crucifixo Reto', equipment: 'Anilhas e Halteres', tip: 'Mantenha leve flexão nos cotovelos durante o arco.' },
    { name: 'Crossover na Polia', equipment: 'Máquinas de Academia', tip: 'Contraia o peitoral no ponto máximo de cruzamento.' },
    { name: 'Supino Vertical Máquina', equipment: 'Máquinas de Academia', tip: 'Ajuste o banco na altura do peitoral médio.' },
  ],
  Costas: [
    { name: 'Puxada Frontal na Polia', equipment: 'Máquinas de Academia', tip: 'Puxe com os cotovelos em direção ao quadril.' },
    { name: 'Remada Curvada com Barra/Halteres', equipment: 'Anilhas e Halteres', tip: 'Mantenha a coluna neutra e quadril empinado.' },
    { name: 'Barra Fixa (Pronada/Supinada)', equipment: 'Barra Fixa', tip: 'Eleve o peito em direção à barra sem balançar.' },
    { name: 'Remada Unilateral com Halter (Serrote)', equipment: 'Anilhas e Halteres', tip: 'Apoie joelho no banco e puxe rente ao corpo.' },
    { name: 'Remada Baixa no Cabo', equipment: 'Máquinas de Academia', tip: 'Mantenha a postura ereta ao puxar o triângulo.' },
    { name: 'Remada com Elástico', equipment: 'Elásticos/Extensores', tip: 'Mantenha a tensão do elástico contínua.' },
  ],
  Pernas: [
    { name: 'Agachamento Livre', equipment: 'Anilhas e Halteres', tip: 'Pés na largura dos ombros, joelhos alinhados com os pés.' },
    { name: 'Leg Press 45°', equipment: 'Máquinas de Academia', tip: 'Não trave os joelhos no topo do movimento.' },
    { name: 'Agachamento Búlgaro', equipment: 'Anilhas e Halteres', tip: 'Tronco levemente inclinado para frente, peso na perna da frente.' },
    { name: 'Afundo com Halteres', equipment: 'Anilhas e Halteres', tip: 'Passadas firmes mantendo o equilíbrio do quadril.' },
    { name: 'Cadeira Extensora', equipment: 'Máquinas de Academia', tip: 'Pausa de 1 segundo na extensão máxima do quadríceps.' },
    { name: 'Mesa Flexora / Cadeira Flexora', equipment: 'Máquinas de Academia', tip: 'Foque na flexão posterior da coxa sem alavancar o quadril.' },
    { name: 'Stiff com Halteres', equipment: 'Anilhas e Halteres', tip: 'Sinta o alongamento dos posteriores mantendo a coluna neutra.' },
    { name: 'Agachamento Livre com Peso Corporal', equipment: 'Peso Corporal', tip: 'Amplitude máxima respeitando a mobilidade do quadril.' },
    { name: 'Elevação Pélvica', equipment: 'Anilhas e Halteres', tip: 'Contraia o glúteo no topo por 1 a 2 segundos.' },
    { name: 'Gêmeos em Pé (Panturrilha)', equipment: 'Peso Corporal', tip: 'Alongamento completo na descida e pico de contração no topo.' },
  ],
  Ombros: [
    { name: 'Desenvolvimento com Halteres', equipment: 'Anilhas e Halteres', tip: 'Empurre a carga sem hiperestender a lombar.' },
    { name: 'Elevação Lateral', equipment: 'Anilhas e Halteres', tip: 'Ligeira inclinação dos halteres como se despejasse água.' },
    { name: 'Elevação Frontal', equipment: 'Anilhas e Halteres', tip: 'Suba até a linha dos olhos com controle do movimento.' },
    { name: 'Crucifixo Inverso no Peck Deck / Halteres', equipment: 'Anilhas e Halteres', tip: 'Foque no deltoide posterior separando os braços.' },
    { name: 'Desenvolvimento no Desenvolvimento Máquina', equipment: 'Máquinas de Academia', tip: 'Mantenha cotovelos levemente à frente do tronco.' },
    { name: 'Elevação Lateral com Elástico', equipment: 'Elásticos/Extensores', tip: 'Controle tanto a subida quanto a descida da tensão.' },
  ],
  Bíceps: [
    { name: 'Rosca Direta com Halteres/Barra', equipment: 'Anilhas e Halteres', tip: 'Cotovelos fixos ao lado do corpo, sem balançar o tronco.' },
    { name: 'Rosca Alternada com Halteres', equipment: 'Anilhas e Halteres', tip: 'Gire o pulso para fora na subida (supinação).' },
    { name: 'Rosca Martelo com Halteres', equipment: 'Anilhas e Halteres', tip: 'Pegada neutra focando no braquial e antebraço.' },
    { name: 'Rosca Concentrada', equipment: 'Anilhas e Halteres', tip: 'Apoie o cotovelo na parte interna da coxa.' },
    { name: 'Rosca com Elástico', equipment: 'Elásticos/Extensores', tip: 'Pise firme no elástico e flexione os cotovelos.' },
  ],
  Tríceps: [
    { name: 'Tríceps Pulley na Polia', equipment: 'Máquinas de Academia', tip: 'Mantenha os cotovelos travados ao lado do tronco.' },
    { name: 'Tríceps Testa com Halteres', equipment: 'Anilhas e Halteres', tip: 'Dobre apenas os cotovelos descendo em direção à testa/orelhas.' },
    { name: 'Tríceps Francês Unilateral', equipment: 'Anilhas e Halteres', tip: 'Estenda o braço na vertical acima da cabeça.' },
    { name: 'Flexão Diamante', equipment: 'Peso Corporal', tip: 'Mãos juntas formando um triângulo no solo.' },
    { name: 'Tríceps Mergulho no Banco', equipment: 'Peso Corporal', tip: 'Desça o quadril rente ao banco flexionando cotovelos a 90°.' },
  ],
  Core: [
    { name: 'Prancha Abdominal', equipment: 'Peso Corporal', tip: 'Contraia glúteos e abdômen mantendo linha reta.' },
    { name: 'Abdominal Supra (Crunch)', equipment: 'Peso Corporal', tip: 'Eleve as escápulas do chão expelindo o ar.' },
    { name: 'Abdominal Infra na Elevação de Pernas', equipment: 'Peso Corporal', tip: 'Eleve o quadril com controle sem soltar as pernas.' },
    { name: 'Prancha Lateral', equipment: 'Peso Corporal', tip: 'Mantenha o quadril elevado e alinhado.' },
    { name: 'Abdominal Infra no Solo com Elástico', equipment: 'Elásticos/Extensores', tip: 'Tensão constante na elevação da pelve.' },
  ],
};

function hasMatchingEquipment(exerciseEq: string, userEqList: string[]): boolean {
  if (exerciseEq === 'Peso Corporal') return true;
  if (userEqList.includes('Todas as máquinas e pesos da academia') || userEqList.includes('Máquinas de Academia')) {
    return true;
  }
  return userEqList.some((uEq) => exerciseEq.toLowerCase().includes(uEq.toLowerCase()) || uEq.toLowerCase().includes(exerciseEq.toLowerCase()));
}

function getExercisesForMuscle(muscle: string, userEquipment: string[], count: number, avoidList: string[]): Exercise[] {
  const lib = EXERCISE_LIBRARY[muscle] || EXERCISE_LIBRARY['Peito'];
  const avoidLower = avoidList.map((a) => a.toLowerCase().trim()).filter(Boolean);

  const valid = lib.filter((item) => {
    const isAvoided = avoidLower.some((avoid) => item.name.toLowerCase().includes(avoid));
    if (isAvoided) return false;
    return hasMatchingEquipment(item.equipment, userEquipment);
  });

  // Fallback to Bodyweight if list empty
  const available = valid.length > 0 ? valid : lib.filter((item) => item.equipment === 'Peso Corporal');

  const selected = available.slice(0, count);

  return selected.map((item, index) => ({
    id: `ex_${muscle}_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: item.name,
    muscleGroup: muscle,
    sets: 3,
    reps: '10–12',
    restSeconds: 60,
    executionTip: item.tip,
    equipment: item.equipment,
    isCompleted: false,
  }));
}

export function generateLocalFallbackPlan(profile: UserProfile): WorkoutPlan {
  const { objective, experience, location, equipment, daysPerWeek, sessionTimeMin, avoidExercises } = profile;
  const avoidList = avoidExercises ? avoidExercises.split(',').map((s) => s.trim()) : [];

  const sets = experience === 'Avançado' ? 4 : 3;
  const reps = objective === 'Ganho de força' ? '4–6' : objective === 'Ganho de massa muscular' ? '8–12' : '12–15';
  const rest = objective === 'Ganho de força' ? 120 : 60;

  const days: WorkoutDay[] = [];

  // Generate structure based on daysPerWeek
  if (daysPerWeek <= 2) {
    // 2 Days Full Body
    days.push({
      id: 'day_1',
      dayNumber: 1,
      title: 'DIA 1 — CORPO INTEIRO (A)',
      isRestDay: false,
      targetGoal: 'Estímulo global de hipertrofia e condicionamento',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: '5 min de mobilidade articular e aquecimento leve',
      exercises: [
        ...getExercisesForMuscle('Pernas', equipment, 2, avoidList),
        ...getExercisesForMuscle('Peito', equipment, 1, avoidList),
        ...getExercisesForMuscle('Costas', equipment, 1, avoidList),
        ...getExercisesForMuscle('Ombros', equipment, 1, avoidList),
        ...getExercisesForMuscle('Core', equipment, 1, avoidList),
      ],
    });
    days.push({
      id: 'day_2',
      dayNumber: 2,
      title: 'DIA 2 — DESCANSO ATIVO',
      isRestDay: true,
      targetGoal: 'Recuperação muscular e regeneração',
      estimatedDuration: '0 min',
      warmup: 'Caminhada leve ou alongamento',
      exercises: [],
    });
    days.push({
      id: 'day_3',
      dayNumber: 3,
      title: 'DIA 3 — CORPO INTEIRO (B)',
      isRestDay: false,
      targetGoal: 'Estímulo secundário para força e tônus',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: '5 min de mobilidade articular e elevação de batimentos',
      exercises: [
        ...getExercisesForMuscle('Pernas', equipment, 2, avoidList),
        ...getExercisesForMuscle('Costas', equipment, 1, avoidList),
        ...getExercisesForMuscle('Peito', equipment, 1, avoidList),
        ...getExercisesForMuscle('Bíceps', equipment, 1, avoidList),
        ...getExercisesForMuscle('Tríceps', equipment, 1, avoidList),
      ],
    });
  } else if (daysPerWeek === 3) {
    // 3 Days ABC Split (Push / Pull / Legs or Fullbody)
    days.push({
      id: 'day_1',
      dayNumber: 1,
      title: 'DIA 1 — EMPURRAR (PEITO, OMBROS E TRÍCEPS)',
      isRestDay: false,
      targetGoal: 'Trabalho focado nos músculos empurradores superiores',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: '5 min de mobilidade de ombros e rotação de manguito',
      exercises: [
        ...getExercisesForMuscle('Peito', equipment, 2, avoidList),
        ...getExercisesForMuscle('Ombros', equipment, 2, avoidList),
        ...getExercisesForMuscle('Tríceps', equipment, 1, avoidList),
      ],
    });
    days.push({
      id: 'day_2',
      dayNumber: 2,
      title: 'DIA 2 — PUXAR (COSTAS, BÍCEPS E CORE)',
      isRestDay: false,
      targetGoal: 'Fortalecimento da cadeia posterior e braços',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: '5 min de remadas leves e mobilidade torácica',
      exercises: [
        ...getExercisesForMuscle('Costas', equipment, 3, avoidList),
        ...getExercisesForMuscle('Bíceps', equipment, 2, avoidList),
        ...getExercisesForMuscle('Core', equipment, 1, avoidList),
      ],
    });
    days.push({
      id: 'day_3',
      dayNumber: 3,
      title: 'DIA 3 — DESCANSO',
      isRestDay: true,
      targetGoal: 'Recuperação muscular',
      estimatedDuration: '0 min',
      warmup: 'Alongamento',
      exercises: [],
    });
    days.push({
      id: 'day_4',
      dayNumber: 4,
      title: 'DIA 4 — PERNAS E ABS',
      isRestDay: false,
      targetGoal: 'Desenvolvimento dos membros inferiores e centro',
      estimatedDuration: `${Math.min(sessionTimeMin, 55)} min`,
      warmup: '5 min de mobilidade de quadril e tornozelos',
      exercises: [
        ...getExercisesForMuscle('Pernas', equipment, 4, avoidList),
        ...getExercisesForMuscle('Core', equipment, 2, avoidList),
      ],
    });
  } else if (daysPerWeek === 4) {
    // 4 Days Upper / Lower
    days.push({
      id: 'day_1',
      dayNumber: 1,
      title: 'DIA 1 — SUPERIOR A (PEITO + COSTAS + OMBROS)',
      isRestDay: false,
      targetGoal: 'Força e volume no tronco superior',
      estimatedDuration: `${Math.min(sessionTimeMin, 55)} min`,
      warmup: '5 min manguito e polichinelos leves',
      exercises: [
        ...getExercisesForMuscle('Peito', equipment, 2, avoidList),
        ...getExercisesForMuscle('Costas', equipment, 2, avoidList),
        ...getExercisesForMuscle('Ombros', equipment, 1, avoidList),
      ],
    });
    days.push({
      id: 'day_2',
      dayNumber: 2,
      title: 'DIA 2 — INFERIOR A (QUADRÍCEPS + GLÚTEOS + PANTURRILHA)',
      isRestDay: false,
      targetGoal: 'Desenvolvimento de membros inferiores foco anterior',
      estimatedDuration: `${Math.min(sessionTimeMin, 55)} min`,
      warmup: 'Agachamentos com peso corporal e mobilidade de quadril',
      exercises: [
        ...getExercisesForMuscle('Pernas', equipment, 3, avoidList),
        ...getExercisesForMuscle('Core', equipment, 1, avoidList),
      ],
    });
    days.push({
      id: 'day_3',
      dayNumber: 3,
      title: 'DIA 3 — DESCANSO',
      isRestDay: true,
      targetGoal: 'Recuperação central',
      estimatedDuration: '0 min',
      warmup: '',
      exercises: [],
    });
    days.push({
      id: 'day_4',
      dayNumber: 4,
      title: 'DIA 4 — SUPERIOR B (BRAÇOS + OMBROS + CORE)',
      isRestDay: false,
      targetGoal: 'Isolamento de braços e escupra muscular de ombros',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: 'Mobilidade articular de cotovelos e punhos',
      exercises: [
        ...getExercisesForMuscle('Ombros', equipment, 2, avoidList),
        ...getExercisesForMuscle('Bíceps', equipment, 2, avoidList),
        ...getExercisesForMuscle('Tríceps', equipment, 2, avoidList),
        ...getExercisesForMuscle('Core', equipment, 1, avoidList),
      ],
    });
    days.push({
      id: 'day_5',
      dayNumber: 5,
      title: 'DIA 5 — INFERIOR B (POSTERIORES + GLÚTEOS + ABDÔMEN)',
      isRestDay: false,
      targetGoal: 'Fortalecimento de posteriores e glúteos',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: 'Elevação pélvica sem carga e mobilidade de tornozelos',
      exercises: [
        ...getExercisesForMuscle('Pernas', equipment, 3, avoidList),
        ...getExercisesForMuscle('Core', equipment, 2, avoidList),
      ],
    });
  } else {
    // 5-6 Days ABCDE Split
    days.push({
      id: 'day_1',
      dayNumber: 1,
      title: 'DIA 1 — PEITO E ABS',
      isRestDay: false,
      targetGoal: 'Hipertrofia e densidade peitoral',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: 'Flexões de braço e mobilidade de ombro',
      exercises: [
        ...getExercisesForMuscle('Peito', equipment, 3, avoidList),
        ...getExercisesForMuscle('Core', equipment, 2, avoidList),
      ],
    });
    days.push({
      id: 'day_2',
      dayNumber: 2,
      title: 'DIA 2 — COSTAS E LOMBAR',
      isRestDay: false,
      targetGoal: 'Largura e espessura de dorsais',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: 'Mobilidade torácica e puxadas leves',
      exercises: [
        ...getExercisesForMuscle('Costas', equipment, 4, avoidList),
      ],
    });
    days.push({
      id: 'day_3',
      dayNumber: 3,
      title: 'DIA 3 — PERNAS COMPLETO',
      isRestDay: false,
      targetGoal: 'Força e volume de membros inferiores',
      estimatedDuration: `${Math.min(sessionTimeMin, 60)} min`,
      warmup: 'Agachamentos sem carga e mobilidade de quadril',
      exercises: [
        ...getExercisesForMuscle('Pernas', equipment, 4, avoidList),
      ],
    });
    days.push({
      id: 'day_4',
      dayNumber: 4,
      title: 'DIA 4 — OMBROS E TRAPÉZIO',
      isRestDay: false,
      targetGoal: 'Densidade e formato em V nos ombros',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: 'Rotação de ombros e elevações leves',
      exercises: [
        ...getExercisesForMuscle('Ombros', equipment, 3, avoidList),
        ...getExercisesForMuscle('Core', equipment, 1, avoidList),
      ],
    });
    days.push({
      id: 'day_5',
      dayNumber: 5,
      title: 'DIA 5 — BRAÇOS (BÍCEPS + TRÍCEPS)',
      isRestDay: false,
      targetGoal: 'Hipertrofia focada em braços',
      estimatedDuration: `${Math.min(sessionTimeMin, 50)} min`,
      warmup: 'Flexões e roscas leves',
      exercises: [
        ...getExercisesForMuscle('Bíceps', equipment, 3, avoidList),
        ...getExercisesForMuscle('Tríceps', equipment, 3, avoidList),
      ],
    });
  }

  // Adjust sets and reps uniformly across generated exercises
  days.forEach((day) => {
    day.exercises.forEach((ex) => {
      ex.sets = sets;
      ex.reps = reps;
      ex.restSeconds = rest;
    });
  });

  return {
    id: `plan_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    summary: {
      objective,
      experience,
      daysPerWeek,
      sessionTimeMin,
      location,
      equipment,
    },
    days,
    aiAnalysisNotes: `Plano customizado gerado para ${profile.name}. Ajustado para o objetivo de ${objective}, nível ${experience}, considerando os equipamentos disponíveis: ${equipment.join(', ')}.`,
  };
}

export function generateLocalWorkoutPlan(profile: UserProfile): WorkoutPlan {
  return generateLocalFallbackPlan(profile);
}

export async function fetchAIPlanTweak(
  currentPlan: WorkoutPlan,
  tweakPrompt: string,
  profile: UserProfile
): Promise<WorkoutPlan> {
  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, currentPlan, tweakPrompt }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.days && data.days.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error in fetchAIPlanTweak:', err);
  }

  // Fallback: update notes or adjust day count if specified
  const matchDays = tweakPrompt.match(/(\d+)\s*dias/i);
  let updatedProfile = { ...profile };
  if (matchDays && matchDays[1]) {
    updatedProfile.daysPerWeek = Math.min(7, Math.max(2, parseInt(matchDays[1])));
  }

  const newPlan = generateLocalFallbackPlan(updatedProfile);
  newPlan.aiAnalysisNotes = `Plano adaptado com base na sua solicitação: "${tweakPrompt}".`;
  return newPlan;
}

export async function fetchAIPlanGeneration(profile: UserProfile): Promise<WorkoutPlan> {
  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });

    if (!res.ok) {
      console.warn('API Response not ok, falling back to local engine');
      return generateLocalFallbackPlan(profile);
    }

    const data = await res.json();
    if (data && data.days && data.days.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Error fetching AI plan:', err);
  }
  return generateLocalFallbackPlan(profile);
}

export async function fetchAIExerciseAlternatives(
  exercise: Exercise,
  profile: UserProfile
): Promise<ExerciseAlternative[]> {
  try {
    const res = await fetch('/api/substitute-exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise, profile }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.alternatives) && data.alternatives.length > 0) {
        return data.alternatives;
      }
    }
  } catch (err) {
    console.error('Error fetching alternatives from API:', err);
  }

  // Fallback alternatives
  const alternatives = (EXERCISE_LIBRARY[exercise.muscleGroup] || EXERCISE_LIBRARY['Peito'])
    .filter((e) => e.name !== exercise.name && hasMatchingEquipment(e.equipment, profile.equipment))
    .slice(0, 3)
    .map((e) => ({
      originalName: exercise.name,
      alternativeName: e.name,
      muscleGroup: exercise.muscleGroup,
      requiredEquipment: e.equipment,
      reason: `Excelente alternativa para ${exercise.muscleGroup} mantendo o mesmo padrão de movimento com ${e.equipment}.`,
    }));

  return alternatives.length > 0
    ? alternatives
    : [
        {
          originalName: exercise.name,
          alternativeName: `${exercise.muscleGroup} com Peso Corporal`,
          muscleGroup: exercise.muscleGroup,
          requiredEquipment: 'Peso Corporal',
          reason: 'Variante com peso corporal para execução em qualquer lugar.',
        },
      ];
}

export async function fetchAIChatResponse(message: string, profile: UserProfile, currentPlan?: WorkoutPlan): Promise<string> {
  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, profile, currentPlan }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) return data.text;
    }
  } catch (err) {
    console.error('Error calling AI chat endpoint:', err);
  }

  // Intelligent local conversational responses
  const msg = message.toLowerCase();
  if (msg.includes('treino hoje') || msg.includes('qual é meu treino')) {
    const firstDay = currentPlan?.days.find((d) => !d.isRestDay);
    if (firstDay) {
      return `Seu próximo treino programado é o **${firstDay.title}** (${firstDay.estimatedDuration}). Ele contém ${firstDay.exercises.length} exercícios focados em ${firstDay.targetGoal}. Bom treino! 🏋️`;
    }
    return 'Seu treino hoje é um dia de descanso ativado! Aproveite para se hidratar e recuperar os músculos.';
  }

  if (msg.includes('substituir') || msg.includes('trocar')) {
    return 'Você pode substituir qualquer exercício diretamente na página do treino clicando no botão "Substituir". A IA apresentará 3 opções com base no seu nível e equipamentos disponíveis.';
  }

  if (msg.includes('descanso') || msg.includes('tempo de descanso')) {
    return `Para o seu objetivo de **${profile.objective}**, o tempo de descanso recomendado entre as séries é de 60 a 90 segundos. Use o Timer de Descanso no aplicativo para marcar o tempo exato!`;
  }

  if (msg.includes('evolução') || msg.includes('progresso')) {
    return `Sua evolução é registrada na aba **Evolução**. Continue registrando suas cargas e peso corporal a cada sessão. A IA analisa sua consistência e sugerirá aumentos de carga progressivos!`;
  }

  return `Olá ${profile.name}! Sou seu Assistente TREINO IA PRO. Estou aqui para orientar seu plano de **${profile.objective}**, tirar dúvidas sobre execução dos exercícios, descansos e adaptações de carga. Como posso te ajudar agora?`;
}

export async function fetchAIProgressionSuggestions(
  sessions: CompletedSession[],
  profile: UserProfile
): Promise<ProgressionSuggestion[]> {
  if (sessions.length < 2) return [];

  const suggestions: ProgressionSuggestion[] = [];
  const exerciseMap: Record<string, { lastLoad: number; count: number }> = {};

  sessions.forEach((session) => {
    session.exerciseLogs.forEach((ex) => {
      const maxLoad = Math.max(...ex.sets.map((s) => s.loadKg || 0), 0);
      if (maxLoad > 0) {
        if (!exerciseMap[ex.exerciseName]) {
          exerciseMap[ex.exerciseName] = { lastLoad: maxLoad, count: 1 };
        } else {
          exerciseMap[ex.exerciseName].lastLoad = maxLoad;
          exerciseMap[ex.exerciseName].count += 1;
        }
      }
    });
  });

  Object.entries(exerciseMap).forEach(([name, data]) => {
    if (data.count >= 2) {
      const newLoad = Math.round((data.lastLoad + 2) * 10) / 10;
      suggestions.push({
        exerciseId: name,
        exerciseName: name,
        currentLoadKg: data.lastLoad,
        suggestedLoadKg: newLoad,
        currentReps: '8–10',
        suggestedReps: '8–10 com técnica aprimorada',
        reason: `Você manteve a carga de ${data.lastLoad}kg por ${data.count} treinos seguidos com boa consistência. Sugerimos subir para ${newLoad}kg no primeiro jogo de séries.`,
      });
    }
  });

  return suggestions.slice(0, 3);
}

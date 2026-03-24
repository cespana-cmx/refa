export interface Question {
  id: number
  text: string
  category: string
  categoryId: number
  isInverted?: boolean
}

export interface Category {
  id: number
  name: string
  shortName: string
  description: string
  color: string
  questions: Question[]
}

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Estrategia y Visión IA',
    shortName: 'Estrategia',
    description: 'Evaluamos si su área tiene una visión clara y un plan concreto para adoptar inteligencia artificial.',
    color: '#534AB7',
    questions: [
      {
        id: 1,
        text: '¿Tiene su área una visión clara de cómo la IA puede transformar sus operaciones?',
        category: 'Estrategia y Visión IA',
        categoryId: 1,
      },
      {
        id: 2,
        text: '¿Existe un plan documentado para adoptar IA en los próximos 12 meses?',
        category: 'Estrategia y Visión IA',
        categoryId: 1,
      },
      {
        id: 3,
        text: '¿La dirección de su área apoya activamente las iniciativas de IA?',
        category: 'Estrategia y Visión IA',
        categoryId: 1,
      },
      {
        id: 4,
        text: '¿Su área tiene KPIs definidos relacionados con el impacto de la tecnología?',
        category: 'Estrategia y Visión IA',
        categoryId: 1,
      },
      {
        id: 5,
        text: '¿Participa su área en decisiones sobre inversión en tecnología?',
        category: 'Estrategia y Visión IA',
        categoryId: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'Datos y Tecnología',
    shortName: 'Datos',
    description: 'Analizamos la madurez de sus datos y la infraestructura tecnológica disponible en su área.',
    color: '#0F6E56',
    questions: [
      {
        id: 6,
        text: '¿Qué tan accesibles y organizados están los datos de su área?',
        category: 'Datos y Tecnología',
        categoryId: 2,
      },
      {
        id: 7,
        text: '¿Utiliza su área herramientas de análisis de datos regularmente?',
        category: 'Datos y Tecnología',
        categoryId: 2,
      },
      {
        id: 8,
        text: '¿Qué tan actualizada es la infraestructura tecnológica de su área?',
        category: 'Datos y Tecnología',
        categoryId: 2,
      },
      {
        id: 9,
        text: '¿Su área tiene procesos para garantizar la calidad de los datos?',
        category: 'Datos y Tecnología',
        categoryId: 2,
      },
      {
        id: 10,
        text: '¿Integra su área sistemas o plataformas digitales en sus operaciones?',
        category: 'Datos y Tecnología',
        categoryId: 2,
      },
    ],
  },
  {
    id: 3,
    name: 'Procesos y Automatización',
    shortName: 'Procesos',
    description: 'Evaluamos el potencial de automatización y la madurez de los procesos operativos de su área.',
    color: '#BA7517',
    questions: [
      {
        id: 11,
        text: '¿Ha identificado su área procesos repetitivos que podrían automatizarse?',
        category: 'Procesos y Automatización',
        categoryId: 3,
      },
      {
        id: 12,
        text: '¿Tiene su área experiencia previa con herramientas de automatización?',
        category: 'Procesos y Automatización',
        categoryId: 3,
      },
      {
        id: 13,
        text: '¿Qué porcentaje de las tareas diarias de su área son rutinarias y predecibles?',
        category: 'Procesos y Automatización',
        categoryId: 3,
      },
      {
        id: 14,
        text: '¿Documenta su área sus procesos operativos de manera sistemática?',
        category: 'Procesos y Automatización',
        categoryId: 3,
      },
      {
        id: 15,
        text: '¿Ha medido su área el tiempo dedicado a tareas manuales y repetitivas?',
        category: 'Procesos y Automatización',
        categoryId: 3,
      },
    ],
  },
  {
    id: 4,
    name: 'Talento y Cultura',
    shortName: 'Talento',
    description: 'Medimos la disposición del equipo y la cultura organizacional hacia la adopción de IA.',
    color: '#AFA9EC',
    questions: [
      {
        id: 16,
        text: '¿Qué tan abierto está su equipo a adoptar nuevas tecnologías?',
        category: 'Talento y Cultura',
        categoryId: 4,
      },
      {
        id: 17,
        text: '¿Tiene su área personas con habilidades tecnológicas destacadas (AI Champions potenciales)?',
        category: 'Talento y Cultura',
        categoryId: 4,
      },
      {
        id: 18,
        text: '¿Promueve su área una cultura de experimentación e innovación?',
        category: 'Talento y Cultura',
        categoryId: 4,
      },
      {
        id: 19,
        text: '¿Ha recibido su equipo capacitación en herramientas digitales en los últimos 6 meses?',
        category: 'Talento y Cultura',
        categoryId: 4,
      },
      {
        id: 20,
        text: '¿Existe resistencia al cambio tecnológico en su área?',
        category: 'Talento y Cultura',
        categoryId: 4,
        isInverted: true,
      },
    ],
  },
  {
    id: 5,
    name: 'Impacto y Resultados',
    shortName: 'Impacto',
    description: 'Evaluamos los resultados concretos que su área ha logrado con tecnología e innovación digital.',
    color: '#5DCAA5',
    questions: [
      {
        id: 21,
        text: '¿Ha implementado su área alguna solución de IA o automatización?',
        category: 'Impacto y Resultados',
        categoryId: 5,
      },
      {
        id: 22,
        text: '¿Puede medir el impacto de las tecnologías que usa actualmente?',
        category: 'Impacto y Resultados',
        categoryId: 5,
      },
      {
        id: 23,
        text: '¿Ha logrado mejoras en eficiencia gracias a herramientas digitales?',
        category: 'Impacto y Resultados',
        categoryId: 5,
      },
      {
        id: 24,
        text: '¿Comparte su área aprendizajes tecnológicos con otras áreas?',
        category: 'Impacto y Resultados',
        categoryId: 5,
      },
      {
        id: 25,
        text: '¿Qué tanto valora su área la mejora continua basada en datos?',
        category: 'Impacto y Resultados',
        categoryId: 5,
      },
    ],
  },
]

export const ALL_QUESTIONS: Question[] = CATEGORIES.flatMap((c) => c.questions)

export const SCALE_LABELS: Record<number, string> = {
  1: 'Muy bajo / Nunca',
  2: 'Bajo / Casi nunca',
  3: 'Medio / A veces',
  4: 'Alto / Frecuentemente',
  5: 'Muy alto / Siempre',
}

export const INVERTED_SCALE_LABELS: Record<number, string> = {
  1: 'Mucha resistencia',
  2: 'Bastante resistencia',
  3: 'Resistencia moderada',
  4: 'Poca resistencia',
  5: 'Sin resistencia',
}

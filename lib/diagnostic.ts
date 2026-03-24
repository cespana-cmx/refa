export interface Signal {
  key: string
  title: string
  desc: string
  tag: string
}

export const POSITIVE_SIGNALS: Signal[] = [
  {
    key: 'habla_problemas',
    title: 'Habla de problemas concretos con frustración genuina',
    desc: 'Menciona cosas que le duelen del día a día sin que le preguntes',
    tag: 'facilitador',
  },
  {
    key: 'pregunta_como',
    title: 'Pregunta cómo funcionaría la IA en su proceso',
    desc: 'Tiene iniciativa para entender, no solo escucha pasivamente',
    tag: 'curioso',
  },
  {
    key: 'menciona_equipo',
    title: 'Menciona personas del equipo que ya usan algo de tecnología',
    desc: 'Señal de que conoce a su equipo y hay potencial latente',
    tag: 'aliado',
  },
  {
    key: 'propone_ideas',
    title: 'Propone ideas o casos de uso por su cuenta',
    desc: 'Va más allá de responder — construye con la conversación',
    tag: 'activo',
  },
  {
    key: 'acepta_piloto',
    title: 'Acepta fácilmente el piloto de 5 días',
    desc: 'No pone objeciones mayores a probar algo esta semana',
    tag: 'comprometido',
  },
]

export const NEGATIVE_SIGNALS: Signal[] = [
  {
    key: 'respuestas_vagas',
    title: 'Respuestas vagas — "todo funciona bien", "no tenemos problemas"',
    desc: 'Evita señalar fricciones reales. Posible miedo a exposición',
    tag: 'pasivo',
  },
  {
    key: 'mira_equipo',
    title: 'Mira constantemente al equipo antes de responder',
    desc: 'No tiene autoridad clara o teme la reacción de su gente',
    tag: 'inseguro',
  },
  {
    key: 'deriva_a_otros',
    title: 'Desvía preguntas a otras áreas — "eso lo decide sistemas"',
    desc: 'Señal de que no va a impulsar el cambio desde su posición',
    tag: 'bloqueador',
  },
  {
    key: 'duda_piloto',
    title: 'Pone objeciones al piloto — "mejor esperemos", "hay que consultarlo"',
    desc: 'No va a mover a su equipo sin presión externa',
    tag: 'resistente',
  },
  {
    key: 'celular',
    title: 'Revisa el celular o se distrae frecuentemente',
    desc: 'La sesión no es prioridad para esta persona hoy',
    tag: 'desenganchado',
  },
]

export function calcProfileType(positives: string[], negatives: string[]): 'facilitador' | 'resistente' | 'neutral' | 'sin-evaluar' {
  const pos = positives.length
  const neg = negatives.length
  if (pos === 0 && neg === 0) return 'sin-evaluar'
  if (pos > neg + 1) return 'facilitador'
  if (neg > pos + 1) return 'resistente'
  return 'neutral'
}

export const PROFILE_LABELS: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  facilitador: {
    label: 'Facilitador',
    color: '#5DCAA5',
    bg: 'rgba(15, 110, 86, 0.15)',
    desc: 'Líder abierto y activo. Aliado estratégico para el despliegue de IA.',
  },
  neutral: {
    label: 'Neutral',
    color: '#AFA9EC',
    bg: 'rgba(83, 74, 183, 0.12)',
    desc: 'Líder con señales mixtas. Necesita acompañamiento cercano.',
  },
  resistente: {
    label: 'Resistente',
    color: '#EF9F27',
    bg: 'rgba(186, 117, 23, 0.12)',
    desc: 'Líder con fricciones. Requiere manejo estratégico y apoyo desde arriba.',
  },
  'sin-evaluar': {
    label: 'Sin evaluar',
    color: '#5E5A99',
    bg: 'rgba(30, 26, 56, 0.5)',
    desc: 'Aún no has registrado el diagnóstico de este líder.',
  },
}

// Team quadrant logic
export interface MemberScore {
  name: string
  apertura: number
  curiosidad: number
  influencia: number
  carga: number
  total: number
  quadrant: 'champion' | 'latent' | 'skeptic' | 'neutral'
}

export function calcMemberQuadrant(
  apertura: number,
  curiosidad: number,
  influencia: number
): MemberScore['quadrant'] {
  const adoptionPotential = (apertura + curiosidad) / 2
  const influence = influencia
  if (adoptionPotential >= 3.5 && influence >= 3.5) return 'champion'
  if (adoptionPotential >= 3.5 && influence < 3.5) return 'latent'
  if (adoptionPotential < 3.5 && influence >= 3.5) return 'skeptic'
  return 'neutral'
}

export const QUADRANT_LABELS = {
  champion: { label: 'Adoptan Primero', color: '#534AB7', bg: 'rgba(83, 74, 183, 0.12)', icon: '🌟' },
  latent: { label: 'Curiosos', color: '#5DCAA5', bg: 'rgba(15, 110, 86, 0.1)', icon: '💡' },
  skeptic: { label: 'Escépticos', color: '#EF9F27', bg: 'rgba(186, 117, 23, 0.08)', icon: '⚠️' },
  neutral: { label: 'Siguen al grupo', color: '#9994CC', bg: 'rgba(30, 26, 56, 0.5)', icon: '🔄' },
}

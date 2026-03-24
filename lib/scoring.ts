import { CATEGORIES, ALL_QUESTIONS } from './questions'

export interface CategoryScore {
  categoryId: number
  categoryName: string
  score: number
  shortName: string
  color: string
}

export interface AssessmentScore {
  overall: number
  categories: CategoryScore[]
  maturityLevel: MaturityLevel
  maturityLabel: string
  maturityDescription: string
  recommendations: string[]
}

export type MaturityLevel = 'inicial' | 'en-desarrollo' | 'avanzado' | 'ia-first'

export interface MaturityInfo {
  level: MaturityLevel
  label: string
  description: string
  color: string
  bgColor: string
  minScore: number
  maxScore: number
}

export const MATURITY_LEVELS: MaturityInfo[] = [
  {
    level: 'inicial',
    label: 'Inicial',
    description: 'Su área está en las primeras etapas de conciencia sobre IA. Es el momento de comenzar a explorar.',
    color: '#EF9F27',
    bgColor: 'rgba(239, 159, 39, 0.15)',
    minScore: 1.0,
    maxScore: 2.0,
  },
  {
    level: 'en-desarrollo',
    label: 'En Desarrollo',
    description: 'Su área tiene bases para crecer. Con el plan correcto, puede acelerar significativamente.',
    color: '#AFA9EC',
    bgColor: 'rgba(175, 169, 236, 0.15)',
    minScore: 2.1,
    maxScore: 3.0,
  },
  {
    level: 'avanzado',
    label: 'Avanzado',
    description: 'Su área demuestra madurez digital sólida. Está lista para implementar IA de manera estratégica.',
    color: '#5DCAA5',
    bgColor: 'rgba(93, 202, 165, 0.15)',
    minScore: 3.1,
    maxScore: 4.0,
  },
  {
    level: 'ia-first',
    label: 'IA-First',
    description: 'Su área es pionera en adopción de IA. Puede convertirse en referente para toda la organización.',
    color: '#534AB7',
    bgColor: 'rgba(83, 74, 183, 0.15)',
    minScore: 4.1,
    maxScore: 5.0,
  },
]

const RECOMMENDATIONS: Record<MaturityLevel, string[]> = {
  inicial: [
    'Desarrollar una visión clara de cómo la IA puede beneficiar al área',
    'Identificar y documentar los 3 procesos más repetitivos del área',
    'Organizar los datos existentes en formatos estructurados y accesibles',
    'Designar un AI Champion dentro del equipo para liderar el cambio',
    'Participar en talleres de sensibilización sobre IA con el equipo',
  ],
  'en-desarrollo': [
    'Crear un plan formal de adopción de IA con hitos y métricas',
    'Implementar una herramienta de automatización en un proceso piloto',
    'Establecer KPIs tecnológicos y hacer seguimiento mensual',
    'Invertir en capacitación técnica para al menos el 50% del equipo',
    'Conectar con otras áreas para compartir aprendizajes y mejores prácticas',
  ],
  avanzado: [
    'Escalar las soluciones de automatización existentes a más procesos',
    'Desarrollar un programa formal de AI Champions en el área',
    'Implementar análisis predictivo para la toma de decisiones',
    'Compartir casos de éxito y metodologías con toda la organización',
    'Explorar soluciones de IA generativa para mejorar la productividad',
  ],
  'ia-first': [
    'Liderar la transformación digital en toda la organización',
    'Desarrollar casos de uso avanzados con IA generativa y machine learning',
    'Crear un centro de excelencia en IA para apoyar a otras áreas',
    'Establecer alianzas con proveedores de tecnología para innovación',
    'Publicar y compartir la metodología de transformación con el ecosistema',
  ],
}

export function getMaturityInfo(score: number): MaturityInfo {
  if (score <= 2.0) return MATURITY_LEVELS[0]
  if (score <= 3.0) return MATURITY_LEVELS[1]
  if (score <= 4.0) return MATURITY_LEVELS[2]
  return MATURITY_LEVELS[3]
}

export function calculateScore(responses: Record<number, number>): AssessmentScore {
  const categoryScores: CategoryScore[] = CATEGORIES.map((category) => {
    const questions = category.questions
    let totalScore = 0
    let answeredCount = 0

    for (const question of questions) {
      const value = responses[question.id]
      if (value !== undefined && value !== null) {
        const score = question.isInverted ? 6 - value : value
        totalScore += score
        answeredCount++
      }
    }

    const score = answeredCount > 0 ? totalScore / answeredCount : 0

    return {
      categoryId: category.id,
      categoryName: category.name,
      shortName: category.shortName,
      score: Math.round(score * 100) / 100,
      color: category.color,
    }
  })

  const overallScore =
    categoryScores.length > 0
      ? categoryScores.reduce((sum, c) => sum + c.score, 0) / categoryScores.length
      : 0

  const overall = Math.round(overallScore * 100) / 100
  const maturityInfo = getMaturityInfo(overall)

  return {
    overall,
    categories: categoryScores,
    maturityLevel: maturityInfo.level,
    maturityLabel: maturityInfo.label,
    maturityDescription: maturityInfo.description,
    recommendations: RECOMMENDATIONS[maturityInfo.level],
  }
}

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function getScorePercentage(score: number): number {
  return ((score - 1) / 4) * 100
}

export function isAssessmentComplete(responses: Record<number, number>): boolean {
  return ALL_QUESTIONS.every((q) => responses[q.id] !== undefined && responses[q.id] !== null)
}

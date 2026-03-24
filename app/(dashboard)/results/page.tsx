import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { calculateScore, getMaturityInfo, MATURITY_LEVELS, formatScore } from '@/lib/scoring'
import { CATEGORIES } from '@/lib/questions'
import MaturityBadge from '@/components/MaturityBadge'
import RadarChart from '@/components/RadarChart'
import Link from 'next/link'

export default async function ResultsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const latestCompleted = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    include: { responses: true },
  })

  if (!latestCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(83, 74, 183, 0.15)', border: '1px solid rgba(83, 74, 183, 0.2)' }}
        >
          <svg className="w-10 h-10" style={{ color: '#AFA9EC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">Aún no tienes resultados</h2>
        <p className="text-text-secondary mb-6">
          Completa tu primera evaluación de madurez IA para ver tu reporte detallado.
        </p>
        <Link href="/assessment/new" className="btn-primary inline-flex items-center gap-2">
          Comenzar Evaluación
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    )
  }

  // Calculate scores
  const responsesMap: Record<number, number> = {}
  for (const r of latestCompleted.responses) {
    responsesMap[r.questionId] = r.value
  }

  const scoreResult = calculateScore(responsesMap)
  const maturityInfo = getMaturityInfo(scoreResult.overall)

  const radarData = scoreResult.categories.map((cat) => ({
    label: cat.shortName,
    value: cat.score,
    maxValue: 5,
    color: cat.color,
  }))

  // Score percentage for ring
  const scorePercent = ((scoreResult.overall - 1) / 4) * 100
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (scorePercent / 100) * circumference

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Resultados de tu Evaluación</h1>
        <p className="text-text-secondary mt-1">
          {session.user.areaName && `${session.user.areaName} · `}
          Completado el{' '}
          {new Date(latestCompleted.completedAt!).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Overall score + maturity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Score ring */}
        <div
          className="card flex flex-col items-center justify-center py-8"
          style={{ border: `1px solid ${maturityInfo.color}30` }}
        >
          <div className="relative mb-4">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r="54"
                fill="none"
                stroke="rgba(83, 74, 183, 0.15)"
                strokeWidth="10"
              />
              <circle
                cx="65"
                cy="65"
                r="54"
                fill="none"
                stroke={maturityInfo.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 65 65)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-text-primary">
                {formatScore(scoreResult.overall)}
              </span>
              <span className="text-text-secondary text-sm">de 5.0</span>
            </div>
          </div>

          <MaturityBadge
            level={maturityInfo.level}
            score={scoreResult.overall}
            size="lg"
          />
          <p className="text-text-secondary text-xs text-center mt-3 px-4">
            {maturityInfo.description}
          </p>
        </div>

        {/* Radar chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-text-primary mb-4">Perfil de Madurez por Categoría</h3>
          <RadarChart data={radarData} size={280} />
        </div>
      </div>

      {/* Category scores */}
      <div className="card mb-8">
        <h3 className="font-semibold text-text-primary mb-5">Puntaje por Categoría</h3>
        <div className="space-y-4">
          {scoreResult.categories.map((cat) => {
            const percent = ((cat.score - 1) / 4) * 100
            const category = CATEGORIES.find((c) => c.id === cat.categoryId)
            return (
              <div key={cat.categoryId}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-text-primary text-sm font-medium">{cat.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary text-xs hidden sm:block">
                      {category?.description.split('.')[0]}
                    </span>
                    <span className="font-bold text-text-primary">{formatScore(cat.score)}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percent}%`,
                      background: `linear-gradient(90deg, ${cat.color}aa, ${cat.color})`,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Maturity levels reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {MATURITY_LEVELS.map((level) => (
          <div
            key={level.level}
            className="rounded-xl p-4 transition-all duration-200"
            style={{
              background:
                level.level === maturityInfo.level ? level.bgColor : 'rgba(22, 19, 42, 0.5)',
              border:
                level.level === maturityInfo.level
                  ? `1.5px solid ${level.color}50`
                  : '1px solid rgba(30, 26, 56, 0.5)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: level.color }} />
              <span className="font-semibold text-sm" style={{ color: level.color }}>
                {level.label}
              </span>
              {level.level === maturityInfo.level && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
                  style={{ background: `${level.color}20`, color: level.color }}
                >
                  Tú
                </span>
              )}
            </div>
            <p className="text-text-secondary text-xs">
              {level.minScore.toFixed(1)} – {level.maxScore.toFixed(1)}
            </p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          background: `${maturityInfo.color}0D`,
          border: `1px solid ${maturityInfo.color}25`,
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${maturityInfo.color}20` }}
          >
            <svg className="w-5 h-5" style={{ color: maturityInfo.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Recomendaciones para tu área</h3>
            <p className="text-text-secondary text-sm">Nivel {maturityInfo.label} · Próximos pasos sugeridos</p>
          </div>
        </div>

        <div className="space-y-3">
          {scoreResult.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                style={{ background: `${maturityInfo.color}25`, color: maturityInfo.color }}
              >
                {idx + 1}
              </div>
              <p className="text-text-primary text-sm leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/assessment/new" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Nueva Evaluación
        </Link>
        <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

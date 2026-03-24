import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getMaturityInfo } from '@/lib/scoring'
import MaturityBadge from '@/components/MaturityBadge'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const assessments = await prisma.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { responses: true } } },
  })

  const completed = assessments.filter((a) => a.status === 'COMPLETED')
  const draft = assessments.find((a) => a.status === 'DRAFT')
  const lastCompleted = completed[0]
  const isAdmin = session.user.role === 'ADMIN'

  // Team eval status for non-admins
  let teamStatus = null
  if (!isAdmin) {
    const teamMembers = await prisma.teamMember.findMany({
      where: { userId: session.user.id },
      include: { evaluation: true },
    })
    const evaluated = teamMembers.filter((m) => m.evaluation)
    teamStatus = { total: teamMembers.length, evaluated: evaluated.length }
  }

  // Stats for admin
  let adminStats = null
  if (isAdmin) {
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } })
    const totalAssessments = await prisma.assessment.count({ where: { status: 'COMPLETED' } })
    const avgScore = await prisma.assessment.aggregate({
      where: { status: 'COMPLETED', score: { not: null } },
      _avg: { score: true },
    })
    adminStats = { totalUsers, totalAssessments, avgScore: avgScore._avg.score }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Hola, {session.user.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-text-secondary mt-1">
          {isAdmin
            ? 'Panel de administración del diagnóstico de madurez IA'
            : `Diagnóstico de madurez IA · ${session.user.areaName || 'Tu área'}`}
        </p>
      </div>

      {/* Admin stats */}
      {isAdmin && adminStats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(83, 74, 183, 0.15)' }}>
                <svg className="w-5 h-5" style={{ color: '#AFA9EC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-text-secondary text-sm">Líderes de Área</span>
            </div>
            <p className="text-4xl font-bold text-text-primary">{adminStats.totalUsers}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(15, 110, 86, 0.15)' }}>
                <svg className="w-5 h-5" style={{ color: '#5DCAA5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-text-secondary text-sm">Evaluaciones Completadas</span>
            </div>
            <p className="text-4xl font-bold text-text-primary">{adminStats.totalAssessments}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(186, 117, 23, 0.15)' }}>
                <svg className="w-5 h-5" style={{ color: '#EF9F27' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className="text-text-secondary text-sm">Puntaje Promedio</span>
            </div>
            <p className="text-4xl font-bold text-text-primary">
              {adminStats.avgScore ? adminStats.avgScore.toFixed(1) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* 2-step progress for leaders */}
      {!isAdmin && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Step 1: Assessment IA */}
          <div
            className="rounded-xl p-4"
            style={{
              background: lastCompleted
                ? 'rgba(15, 110, 86, 0.1)'
                : draft
                ? 'rgba(186, 117, 23, 0.08)'
                : 'rgba(22, 19, 42, 0.6)',
              border: lastCompleted
                ? '1px solid rgba(93, 202, 165, 0.2)'
                : draft
                ? '1px solid rgba(186, 117, 23, 0.2)'
                : '1px solid rgba(30, 26, 56, 0.8)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: lastCompleted ? '#0F6E56' : draft ? '#BA7517' : 'rgba(83, 74, 183, 0.3)',
                  color: '#fff',
                }}
              >
                {lastCompleted ? '✓' : '1'}
              </div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Paso 1</span>
            </div>
            <div className="font-semibold text-text-primary text-sm mb-1">Assessment de Madurez IA</div>
            <div className="text-xs text-text-secondary">
              {lastCompleted
                ? `Completado · ${lastCompleted.score?.toFixed(1)}/5.0`
                : draft
                ? `En progreso · ${draft._count.responses}/25 preguntas`
                : '25 preguntas · ~10 min'}
            </div>
          </div>

          {/* Step 2: Team Evaluation */}
          <div
            className="rounded-xl p-4"
            style={{
              background:
                teamStatus && teamStatus.total > 0 && teamStatus.evaluated === teamStatus.total
                  ? 'rgba(15, 110, 86, 0.1)'
                  : teamStatus && teamStatus.evaluated > 0
                  ? 'rgba(186, 117, 23, 0.08)'
                  : 'rgba(22, 19, 42, 0.6)',
              border:
                teamStatus && teamStatus.total > 0 && teamStatus.evaluated === teamStatus.total
                  ? '1px solid rgba(93, 202, 165, 0.2)'
                  : teamStatus && teamStatus.evaluated > 0
                  ? '1px solid rgba(186, 117, 23, 0.2)'
                  : '1px solid rgba(30, 26, 56, 0.8)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background:
                    teamStatus && teamStatus.total > 0 && teamStatus.evaluated === teamStatus.total
                      ? '#0F6E56'
                      : teamStatus && teamStatus.evaluated > 0
                      ? '#BA7517'
                      : 'rgba(83, 74, 183, 0.3)',
                  color: '#fff',
                }}
              >
                {teamStatus && teamStatus.total > 0 && teamStatus.evaluated === teamStatus.total ? '✓' : '2'}
              </div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Paso 2</span>
            </div>
            <div className="font-semibold text-text-primary text-sm mb-1">Evaluación de tu Equipo</div>
            <div className="text-xs text-text-secondary">
              {teamStatus && teamStatus.total > 0
                ? `${teamStatus.evaluated}/${teamStatus.total} integrantes evaluados`
                : '4 dimensiones · AI Champions'}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main CTA card */}
        <div className="lg:col-span-2">
          {draft ? (
            <div
              className="rounded-xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(83, 74, 183, 0.2) 0%, rgba(22, 19, 42, 0.8) 100%)',
                border: '1px solid rgba(83, 74, 183, 0.3)',
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10"
                style={{ background: 'radial-gradient(circle, #534AB7, transparent)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-mid animate-pulse" />
                  <span className="text-amber-mid text-sm font-medium">En Progreso</span>
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-1">
                  Tienes una evaluación en curso
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  Respondiste {draft._count.responses} de 25 preguntas. Continúa para completar tu diagnóstico.
                </p>
                <div className="progress-bar mb-4">
                  <div
                    className="progress-fill"
                    style={{ width: `${(draft._count.responses / 25) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary mb-4">
                  {draft._count.responses}/25 preguntas completadas
                </p>
                <Link href={`/assessment/${draft.id}`} className="btn-primary inline-flex items-center gap-2">
                  Continuar Evaluación
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : lastCompleted ? (
            <div
              className="rounded-xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 110, 86, 0.15) 0%, rgba(22, 19, 42, 0.8) 100%)',
                border: '1px solid rgba(15, 110, 86, 0.25)',
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10"
                style={{ background: 'radial-gradient(circle, #0F6E56, transparent)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-teal-mid" />
                  <span className="text-teal-mid text-sm font-medium">Completado</span>
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-1">
                  Última evaluación completada
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  Completaste tu diagnóstico de madurez IA.
                  {lastCompleted.completedAt &&
                    ` Fecha: ${new Date(lastCompleted.completedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-text-secondary text-xs mb-0.5">Puntaje</p>
                    <p className="text-3xl font-bold text-text-primary">{lastCompleted.score?.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs mb-0.5">Nivel</p>
                    {lastCompleted.score && (
                      <MaturityBadge
                        level={getMaturityInfo(lastCompleted.score).level}
                        score={lastCompleted.score}
                        size="md"
                      />
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href="/results" className="btn-primary inline-flex items-center gap-2">
                    Ver Resultados
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link href="/assessment/new" className="btn-secondary inline-flex items-center gap-2">
                    Nueva Evaluación
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(83, 74, 183, 0.15) 0%, rgba(22, 19, 42, 0.8) 100%)',
                border: '1px solid rgba(83, 74, 183, 0.25)',
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
                style={{ background: 'radial-gradient(circle, #534AB7, transparent)' }} />
              <div className="relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(83, 74, 183, 0.2)', border: '1px solid rgba(83, 74, 183, 0.3)' }}
                >
                  <svg className="w-8 h-8" style={{ color: '#AFA9EC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Comienza tu diagnóstico de madurez IA
                </h2>
                <p className="text-text-secondary mb-6 max-w-lg">
                  Evalúa en 10 minutos el nivel de preparación de tu área para adoptar inteligencia artificial.
                  Obtendrás un reporte detallado con recomendaciones personalizadas.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  {['25 preguntas', '5 categorías', '~10 minutos', 'Reporte inmediato'].map((feat) => (
                    <div key={feat} className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <svg className="w-4 h-4 text-teal-mid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </div>
                  ))}
                </div>
                <Link href="/assessment/new" className="btn-primary inline-flex items-center gap-2">
                  Iniciar Evaluación
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Assessment history / Info */}
        <div className="space-y-4">
          {/* 5 Categories overview */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4 text-sm">5 Categorías Evaluadas</h3>
            <div className="space-y-3">
              {[
                { name: 'Estrategia y Visión IA', color: '#534AB7', icon: '🎯' },
                { name: 'Datos y Tecnología', color: '#0F6E56', icon: '💾' },
                { name: 'Procesos y Automatización', color: '#BA7517', icon: '⚙️' },
                { name: 'Talento y Cultura', color: '#AFA9EC', icon: '👥' },
                { name: 'Impacto y Resultados', color: '#5DCAA5', icon: '📈' },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-text-secondary text-xs">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {completed.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-3 text-sm">Historial</h3>
              <div className="space-y-2">
                {completed.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href={`/results`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-bg3 transition-colors"
                  >
                    <div>
                      <p className="text-text-primary text-xs font-medium">
                        {new Date(a.completedAt || a.createdAt).toLocaleDateString('es-CO', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.score && (
                        <MaturityBadge
                          level={getMaturityInfo(a.score).level}
                          score={a.score}
                          size="sm"
                          showScore
                        />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

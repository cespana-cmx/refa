import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getMaturityInfo } from '@/lib/scoring'
import {
  PROFILE_LABELS,
  QUADRANT_LABELS,
  calcMemberQuadrant,
} from '@/lib/diagnostic'
import MaturityBadge from '@/components/MaturityBadge'

export default async function AreaDetailPage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/dashboard')

  const [user, assessment, teamMembers, diagnostic] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, name: true, email: true, areaName: true, createdAt: true },
    }),
    prisma.assessment.findFirst({
      where: { userId: params.userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.teamMember.findMany({
      where: { userId: params.userId },
      include: { evaluation: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.leaderDiagnostic.findUnique({
      where: { userId: params.userId },
    }),
  ])

  if (!user) redirect('/admin')

  const profileType = diagnostic?.profileType ?? 'sin-evaluar'
  const profile = PROFILE_LABELS[profileType] ?? PROFILE_LABELS['sin-evaluar']
  const maturity = assessment?.score ? getMaturityInfo(assessment.score) : null

  // categoryScores is stored as array of {categoryName, score, ...}
  type CatScore = { categoryName: string; score: number }
  const categoryScoresRaw = assessment?.categoryScores as CatScore[] | Record<string, number> | null
  const categoryScores: Record<string, number> | null = categoryScoresRaw
    ? Array.isArray(categoryScoresRaw)
      ? Object.fromEntries(categoryScoresRaw.map((c) => [c.categoryName, c.score]))
      : categoryScoresRaw
    : null

  // Team champion analysis
  const evaluatedMembers = teamMembers.filter((m) => m.evaluation)
  const memberQuadrants = evaluatedMembers.map((m) => {
    const q = calcMemberQuadrant(m.evaluation!.apertura, m.evaluation!.curiosidad, m.evaluation!.influencia)
    const total = (m.evaluation!.apertura + m.evaluation!.curiosidad + m.evaluation!.influencia + m.evaluation!.carga) / 4
    return { name: m.name, quadrant: q, total, carga: m.evaluation!.carga }
  })

  const champions = memberQuadrants.filter((m) => m.quadrant === 'champion').sort((a, b) => b.total - a.total)
  const byQuadrant = {
    champion: memberQuadrants.filter((m) => m.quadrant === 'champion'),
    latent: memberQuadrants.filter((m) => m.quadrant === 'latent'),
    skeptic: memberQuadrants.filter((m) => m.quadrant === 'skeptic'),
    neutral: memberQuadrants.filter((m) => m.quadrant === 'neutral'),
  }

  const CATEGORY_NAMES = ['Estrategia y Visión IA', 'Datos y Tecnología', 'Procesos y Automatización', 'Talento y Cultura', 'Impacto y Resultados']
  const CATEGORY_COLORS = ['#534AB7', '#0F6E56', '#BA7517', '#AFA9EC', '#5DCAA5']

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back */}
      <Link href="/admin" className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors w-fit">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al panel
      </Link>

      {/* Area header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{user.areaName ?? user.name}</h1>
          <p className="text-text-secondary text-sm mt-1">{user.name} · {user.email}</p>
        </div>
        <Link
          href={`/admin/diagnostic/${params.userId}`}
          className="btn-primary flex items-center gap-2 text-sm"
          style={{ background: 'rgba(83, 74, 183, 0.3)', border: '1px solid rgba(83, 74, 183, 0.5)' }}
        >
          🔒 {diagnostic ? 'Editar diagnóstico del líder' : 'Agregar diagnóstico del líder'}
        </Link>
      </div>

      {/* Two columns: Assessment + Leader diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* Assessment del líder */}
        <div className="rounded-xl p-5" style={{ background: 'rgba(22, 19, 42, 0.8)', border: '1px solid rgba(30, 26, 56, 0.8)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              📋 Assessment del líder
            </div>
            {!assessment && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(186, 117, 23, 0.15)', color: '#EF9F27' }}>
                Pendiente
              </span>
            )}
          </div>

          {assessment && maturity ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <div className="text-4xl font-bold text-text-primary">{assessment.score?.toFixed(1)}</div>
                  <div className="text-xs text-text-secondary">de 5.0</div>
                </div>
                <MaturityBadge level={maturity.level} score={assessment.score!} size="md" />
              </div>

              {categoryScores && (
                <div className="space-y-2">
                  {CATEGORY_NAMES.map((name, idx) => {
                    const score = categoryScores[name] ?? 0
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-text-secondary truncate">{name}</span>
                          <span className="font-mono font-bold ml-2 flex-shrink-0" style={{ color: CATEGORY_COLORS[idx] }}>
                            {score.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(30, 26, 56, 0.8)' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${(score / 5) * 100}%`, background: CATEGORY_COLORS[idx] }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-text-secondary text-sm">El líder aún no ha completado su assessment</p>
            </div>
          )}
        </div>

        {/* Diagnóstico del líder (Christian) */}
        <div
          className="rounded-xl p-5"
          style={{ background: diagnostic ? profile.bg : 'rgba(22, 19, 42, 0.8)', border: `1px solid ${diagnostic ? profile.color + '30' : 'rgba(30, 26, 56, 0.8)'}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              🔒 Diagnóstico del líder · Privado
            </div>
          </div>

          {diagnostic ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{ background: `${profile.color}20`, color: profile.color }}
                >
                  {profileType === 'facilitador' ? '✅' : profileType === 'resistente' ? '⚠️' : '〰️'}
                </div>
                <div>
                  <div className="font-bold text-text-primary">{profile.label}</div>
                  <div className="text-xs text-text-secondary">{profile.desc}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(15, 110, 86, 0.12)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#5DCAA5' }}>
                    {(diagnostic.positiveSignals as string[]).length}
                  </div>
                  <div className="text-xs text-text-secondary">Señales positivas</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(186, 117, 23, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#EF9F27' }}>
                    {(diagnostic.negativeSignals as string[]).length}
                  </div>
                  <div className="text-xs text-text-secondary">Señales de alerta</div>
                </div>
              </div>

              {diagnostic.note && (
                <div
                  className="rounded-lg p-3 text-xs text-text-secondary italic"
                  style={{ background: 'rgba(14, 12, 30, 0.5)', border: '1px solid rgba(83, 74, 183, 0.1)' }}
                >
                  "{diagnostic.note}"
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-text-secondary text-sm mb-4">Aún no has registrado tu diagnóstico de este líder</p>
              <Link href={`/admin/diagnostic/${params.userId}`} className="btn-primary text-sm">
                Agregar diagnóstico
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Team evaluation */}
      <div className="rounded-xl p-5 mb-5" style={{ background: 'rgba(22, 19, 42, 0.8)', border: '1px solid rgba(30, 26, 56, 0.8)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            👥 Evaluación del equipo · {teamMembers.length} integrantes
          </div>
          <span className="text-xs text-text-secondary">
            {evaluatedMembers.length} de {teamMembers.length} evaluados
          </span>
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-text-secondary text-sm">El líder aún no ha agregado a su equipo</p>
          </div>
        ) : (
          <>
            {/* Quadrant map */}
            {evaluatedMembers.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                {(['champion', 'latent', 'skeptic', 'neutral'] as const).map((q) => {
                  const info = QUADRANT_LABELS[q]
                  const members = byQuadrant[q]
                  return (
                    <div
                      key={q}
                      className="rounded-xl p-3 min-h-16"
                      style={{ background: info.bg, border: `1px solid ${info.color}25` }}
                    >
                      <div className="text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: info.color }}>
                        {info.icon} {info.label}
                      </div>
                      {members.length === 0 ? (
                        <div className="text-xs text-text-secondary">—</div>
                      ) : (
                        <div className="space-y-0.5">
                          {members.map((m) => (
                            <div key={m.name} className="text-xs text-text-secondary">
                              {m.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Champions highlight */}
            {champions.length > 0 && (
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: 'rgba(83, 74, 183, 0.1)', border: '1px solid rgba(83, 74, 183, 0.25)' }}
              >
                <div className="text-xs font-semibold mb-3" style={{ color: '#AFA9EC' }}>
                  🌟 AI Champions identificados
                </div>
                <div className="flex flex-wrap gap-2">
                  {champions.map((c, i) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                      style={{
                        background: i === 0 ? 'rgba(83, 74, 183, 0.25)' : 'rgba(83, 74, 183, 0.12)',
                        border: `1px solid rgba(83, 74, 183, ${i === 0 ? 0.5 : 0.25})`,
                      }}
                    >
                      <span className="font-semibold text-text-primary">{c.name}</span>
                      <span className="text-xs font-mono" style={{ color: '#AFA9EC' }}>{c.total.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member list */}
            <div className="space-y-2">
              {teamMembers.map((member) => {
                const ev = member.evaluation
                if (!ev) return (
                  <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(14, 12, 30, 0.4)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(83, 74, 183, 0.2)', color: '#9994CC' }}>
                      {member.name[0]}
                    </div>
                    <span className="text-text-secondary text-sm">{member.name}</span>
                    <span className="ml-auto text-xs text-text-secondary">Sin evaluar</span>
                  </div>
                )
                const q = calcMemberQuadrant(ev.apertura, ev.curiosidad, ev.influencia)
                const qInfo = QUADRANT_LABELS[q]
                const avg = ((ev.apertura + ev.curiosidad + ev.influencia + ev.carga) / 4).toFixed(1)
                return (
                  <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(14, 12, 30, 0.4)' }}>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #534AB7, #7B74D6)', color: '#fff' }}
                    >
                      {member.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-text-primary text-sm font-medium">{member.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: `${qInfo.color}20`, color: qInfo.color }}>
                      {qInfo.icon} {qInfo.label}
                    </span>
                    <div className="ml-auto flex gap-3 text-xs text-text-secondary">
                      <span title="Apertura">🔓 {ev.apertura}</span>
                      <span title="Curiosidad">💡 {ev.curiosidad}</span>
                      <span title="Influencia">🤝 {ev.influencia}</span>
                      <span title="Carga">📋 {ev.carga}</span>
                      <span className="font-bold text-text-primary">∅ {avg}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

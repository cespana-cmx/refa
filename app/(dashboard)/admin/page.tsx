import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getMaturityInfo, formatScore } from '@/lib/scoring'
import { PROFILE_LABELS } from '@/lib/diagnostic'
import MaturityBadge from '@/components/MaturityBadge'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') redirect('/dashboard')

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      assessments: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 1,
      },
      teamMembers: {
        include: { evaluation: true },
      },
      leaderDiagnostic: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const totalCompleted = users.filter((u) => u.assessments.length > 0).length
  const totalTeamEval = users.filter((u) => u.teamMembers.some((m) => m.evaluation)).length
  const totalDiagnostic = users.filter((u) => u.leaderDiagnostic).length

  const avgScore = users
    .filter((u) => u.assessments[0]?.score)
    .map((u) => u.assessments[0].score!)
  const globalAvg = avgScore.length > 0 ? avgScore.reduce((a, b) => a + b, 0) / avgScore.length : null

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Panel de Administración</h1>
          <p className="text-text-secondary mt-1">
            Diagnóstico de madurez IA · {users.length} áreas
          </p>
        </div>
        <Link href="/admin/users" className="btn-secondary inline-flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Gestionar usuarios
        </Link>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(83, 74, 183, 0.15)' }}>📋</div>
            <div>
              <div className="text-xs text-text-secondary">Assessment IA</div>
              <div className="text-2xl font-bold text-text-primary">{totalCompleted}<span className="text-sm text-text-secondary font-normal">/{users.length}</span></div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${users.length > 0 ? (totalCompleted / users.length) * 100 : 0}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-secondary">Completados</span>
            {globalAvg && <span className="text-xs font-bold text-text-primary">Promedio: {globalAvg.toFixed(1)}</span>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(15, 110, 86, 0.15)' }}>👥</div>
            <div>
              <div className="text-xs text-text-secondary">Eval. de Equipo</div>
              <div className="text-2xl font-bold text-text-primary">{totalTeamEval}<span className="text-sm text-text-secondary font-normal">/{users.length}</span></div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${users.length > 0 ? (totalTeamEval / users.length) * 100 : 0}%`, background: '#5DCAA5' }} />
          </div>
          <div className="mt-2">
            <span className="text-xs text-text-secondary">Líderes que evaluaron su equipo</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(186, 117, 23, 0.15)' }}>🔒</div>
            <div>
              <div className="text-xs text-text-secondary">Diagnóstico del Líder</div>
              <div className="text-2xl font-bold text-text-primary">{totalDiagnostic}<span className="text-sm text-text-secondary font-normal">/{users.length}</span></div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${users.length > 0 ? (totalDiagnostic / users.length) * 100 : 0}%`, background: '#EF9F27' }} />
          </div>
          <div className="mt-2">
            <span className="text-xs text-text-secondary">Diagnósticos privados registrados</span>
          </div>
        </div>
      </div>

      {/* Area cards */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-text-primary">Todas las Áreas</h2>
        <span className="text-text-secondary text-sm">{users.length} líderes</span>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const assessment = user.assessments[0]
          const maturity = assessment?.score ? getMaturityInfo(assessment.score) : null
          const evaluatedMembers = user.teamMembers.filter((m) => m.evaluation)
          const diagnostic = user.leaderDiagnostic
          const profileType = diagnostic?.profileType ?? 'sin-evaluar'
          const profile = PROFILE_LABELS[profileType] ?? PROFILE_LABELS['sin-evaluar']

          const step1Done = !!assessment
          const step2Done = evaluatedMembers.length > 0
          const step3Done = !!diagnostic

          return (
            <Link
              key={user.id}
              href={`/admin/area/${user.id}`}
              className="block rounded-xl p-4 transition-all duration-200 hover:scale-[1.005]"
              style={{
                background: 'rgba(22, 19, 42, 0.8)',
                border: '1px solid rgba(30, 26, 56, 0.8)',
              }}
            >
              <div className="flex items-start gap-4 flex-wrap">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #534AB7, #7B74D6)', color: '#fff' }}
                >
                  {user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-primary">{user.areaName ?? user.name}</span>
                    <span className="text-text-secondary text-xs">{user.name}</span>
                  </div>

                  {/* 3 status pills */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusPill done={step1Done} label="Assessment IA" value={assessment?.score ? formatScore(assessment.score) : undefined} />
                    <StatusPill done={step2Done} label="Equipo" value={step2Done ? `${evaluatedMembers.length}/${user.teamMembers.length}` : undefined} />
                    <StatusPill done={step3Done} label="Diagnóstico líder" value={step3Done ? profile.label : undefined} valueColor={step3Done ? profile.color : undefined} />
                  </div>
                </div>

                {/* Score + badge */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {assessment && maturity ? (
                    <MaturityBadge level={maturity.level} score={assessment.score!} size="sm" showScore />
                  ) : (
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: 'rgba(186, 117, 23, 0.12)', color: '#EF9F27' }}
                    >
                      Pendiente
                    </span>
                  )}
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function StatusPill({
  done,
  label,
  value,
  valueColor,
}: {
  done: boolean
  label: string
  value?: string
  valueColor?: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{
        background: done ? 'rgba(15, 110, 86, 0.12)' : 'rgba(30, 26, 56, 0.6)',
        border: done ? '1px solid rgba(93, 202, 165, 0.2)' : '1px solid rgba(30, 26, 56, 0.8)',
        color: done ? '#5DCAA5' : '#5E5A99',
      }}
    >
      {done ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span>{label}</span>
      {value && (
        <span className="font-bold" style={{ color: valueColor ?? (done ? '#5DCAA5' : undefined) }}>
          · {value}
        </span>
      )}
    </span>
  )
}

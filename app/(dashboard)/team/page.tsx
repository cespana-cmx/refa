'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TeamMember {
  id: string
  name: string
  evaluation: {
    apertura: number
    curiosidad: number
    influencia: number
    carga: number
  } | null
}

const DIMENSIONS = [
  {
    key: 'apertura' as const,
    label: 'Apertura al cambio',
    desc: '¿Cómo reacciona cuando implementas algo nuevo?',
    color: '#534AB7',
    icon: '🔓',
  },
  {
    key: 'curiosidad' as const,
    label: 'Curiosidad tecnológica',
    desc: '¿Experimenta con apps y herramientas por iniciativa propia?',
    color: '#5DCAA5',
    icon: '💡',
  },
  {
    key: 'influencia' as const,
    label: 'Influencia en el equipo',
    desc: 'Cuando adopta algo, ¿los demás tienden a seguirlo?',
    color: '#EF9F27',
    icon: '🤝',
  },
  {
    key: 'carga' as const,
    label: 'Carga de tareas repetitivas',
    desc: '¿Cuánto de su día son tareas que podrían automatizarse?',
    color: '#AFA9EC',
    icon: '📋',
  },
]

const SCALE = [
  { val: 1, label: 'Muy bajo' },
  { val: 2, label: 'Bajo' },
  { val: 3, label: 'Medio' },
  { val: 4, label: 'Alto' },
  { val: 5, label: 'Muy alto' },
]

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [scores, setScores] = useState<
    Record<string, { apertura: number; curiosidad: number; influencia: number; carga: number }>
  >({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [expandedMember, setExpandedMember] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/team')
      .then((r) => r.json())
      .then((data: TeamMember[]) => {
        setMembers(data)
        // Populate scores from existing evaluations
        const initial: typeof scores = {}
        for (const m of data) {
          if (m.evaluation) {
            initial[m.id] = {
              apertura: m.evaluation.apertura,
              curiosidad: m.evaluation.curiosidad,
              influencia: m.evaluation.influencia,
              carga: m.evaluation.carga,
            }
          } else {
            initial[m.id] = { apertura: 3, curiosidad: 3, influencia: 3, carga: 3 }
          }
        }
        setScores(initial)
        // Auto-expand first unevaluated member
        const firstUnevaluated = data.find((m) => !m.evaluation)
        if (firstUnevaluated) setExpandedMember(firstUnevaluated.id)
        else if (data.length > 0) setExpandedMember(data[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  const addMember = async () => {
    if (!newName.trim()) return
    setAdding(true)
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const member: TeamMember = await res.json()
    setMembers((prev) => [...prev, member])
    setScores((prev) => ({ ...prev, [member.id]: { apertura: 3, curiosidad: 3, influencia: 3, carga: 3 } }))
    setNewName('')
    setExpandedMember(member.id)
    setAdding(false)
  }

  const removeMember = async (id: string) => {
    await fetch(`/api/team/${id}`, { method: 'DELETE' })
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setScores((prev) => {
      const n = { ...prev }
      delete n[id]
      return n
    })
    if (expandedMember === id) setExpandedMember(null)
  }

  const saveEvaluation = async (memberId: string) => {
    const s = scores[memberId]
    if (!s) return
    setSaving((prev) => ({ ...prev, [memberId]: true }))
    await fetch(`/api/team/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    })
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, evaluation: s } : m))
    )
    setSaving((prev) => ({ ...prev, [memberId]: false }))
    setSaved((prev) => ({ ...prev, [memberId]: true }))
    setTimeout(() => setSaved((prev) => ({ ...prev, [memberId]: false })), 2500)
    // Move to next unevaluated
    const idx = members.findIndex((m) => m.id === memberId)
    const next = members.slice(idx + 1).find((m) => !m.evaluation || m.id === memberId)
    if (next && next.id !== memberId) setExpandedMember(next.id)
  }

  const evaluatedCount = members.filter((m) => m.evaluation).length
  const allEvaluated = members.length > 0 && evaluatedCount === members.length

  const getTotal = (id: string) => {
    const s = scores[id]
    if (!s) return 0
    return ((s.apertura + s.curiosidad + s.influencia + s.carga) / 4).toFixed(1)
  }

  const getQuadrant = (id: string) => {
    const s = scores[id]
    if (!s) return null
    const potential = (s.apertura + s.curiosidad) / 2
    if (potential >= 3.5 && s.influencia >= 3.5) return { label: 'AI Champion', color: '#534AB7' }
    if (potential >= 3.5 && s.influencia < 3.5) return { label: 'Curioso', color: '#5DCAA5' }
    if (potential < 3.5 && s.influencia >= 3.5) return { label: 'Escéptico', color: '#EF9F27' }
    return { label: 'Neutral', color: '#9994CC' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-2 border-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-4 transition-colors w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Evaluación de tu Equipo</h1>
            <p className="text-text-secondary text-sm mt-1 max-w-lg">
              Califica a cada integrante en 4 dimensiones clave. Esto nos ayuda a identificar los AI Champions de tu área.
            </p>
          </div>
          {allEvaluated && (
            <Link href="/results" className="btn-primary flex items-center gap-2 flex-shrink-0">
              Ver resultados completos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Progress */}
        {members.length > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-text-secondary mb-1.5">
              <span>{evaluatedCount} de {members.length} integrantes evaluados</span>
              <span>{Math.round((evaluatedCount / members.length) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(evaluatedCount / members.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Dimensions legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {DIMENSIONS.map((d) => (
          <div
            key={d.key}
            className="rounded-xl p-3"
            style={{ background: `${d.color}10`, border: `1px solid ${d.color}25` }}
          >
            <div className="text-base mb-1">{d.icon}</div>
            <div className="text-xs font-semibold" style={{ color: d.color }}>{d.label}</div>
            <div className="text-xs text-text-secondary mt-0.5 leading-tight">{d.desc}</div>
          </div>
        ))}
      </div>

      {/* Add member */}
      <div
        className="rounded-xl p-4 mb-5"
        style={{ background: 'rgba(22, 19, 42, 0.8)', border: '1px solid rgba(83, 74, 183, 0.15)' }}
      >
        <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
          Agregar integrante del equipo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMember()}
            placeholder="Nombre del integrante..."
            className="flex-1 bg-bg1 border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm outline-none focus:border-purple placeholder-text-secondary"
          />
          <button
            onClick={addMember}
            disabled={adding || !newName.trim()}
            className="btn-primary px-4 py-2.5 text-sm flex-shrink-0 disabled:opacity-50"
          >
            + Agregar
          </button>
        </div>
      </div>

      {/* Member cards */}
      {members.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{ background: 'rgba(22, 19, 42, 0.5)', border: '1px dashed rgba(83, 74, 183, 0.2)' }}
        >
          <div className="text-3xl mb-3">👥</div>
          <p className="text-text-secondary text-sm">Agrega a los integrantes de tu equipo para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member, idx) => {
            const isExpanded = expandedMember === member.id
            const isEvaluated = !!member.evaluation
            const quadrant = isEvaluated ? getQuadrant(member.id) : null
            const memberScore = scores[member.id] ?? { apertura: 3, curiosidad: 3, influencia: 3, carga: 3 }

            return (
              <div
                key={member.id}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  border: isEvaluated
                    ? '1px solid rgba(93, 202, 165, 0.25)'
                    : isExpanded
                    ? '1px solid rgba(83, 74, 183, 0.4)'
                    : '1px solid rgba(30, 26, 56, 0.8)',
                  background: 'rgba(22, 19, 42, 0.8)',
                }}
              >
                {/* Member header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, #534AB7, #7B74D6)`,
                      opacity: isEvaluated ? 1 : 0.6,
                    }}
                  >
                    {member.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-text-primary font-semibold text-sm">{member.name}</span>
                      {isEvaluated && quadrant && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${quadrant.color}20`, color: quadrant.color }}
                        >
                          {quadrant.label}
                        </span>
                      )}
                    </div>
                    {isEvaluated && (
                      <div className="text-xs text-text-secondary mt-0.5">
                        Promedio: {getTotal(member.id)} / 5
                      </div>
                    )}
                    {!isEvaluated && (
                      <div className="text-xs text-text-secondary">Sin evaluar</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEvaluated && (
                      <svg className="w-4 h-4 text-teal-mid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMember(member.id) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-red-400 transition-colors"
                      style={{ background: 'rgba(30, 26, 56, 0.5)' }}
                    >
                      ×
                    </button>
                    <svg
                      className={`w-4 h-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Evaluation form */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'rgba(83, 74, 183, 0.12)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {DIMENSIONS.map((dim) => (
                        <div
                          key={dim.key}
                          className="rounded-xl p-3"
                          style={{ background: 'rgba(14, 12, 30, 0.6)' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: dim.color }}>
                              {dim.icon} {dim.label}
                            </span>
                            <span className="text-lg font-bold font-mono" style={{ color: dim.color }}>
                              {memberScore[dim.key]}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={5}
                            step={1}
                            value={memberScore[dim.key]}
                            onChange={(e) =>
                              setScores((prev) => ({
                                ...prev,
                                [member.id]: { ...prev[member.id], [dim.key]: parseInt(e.target.value) },
                              }))
                            }
                            className="w-full h-1.5 rounded-full outline-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, ${dim.color} 0%, ${dim.color} ${((memberScore[dim.key] - 1) / 4) * 100}%, rgba(30,26,56,0.8) ${((memberScore[dim.key] - 1) / 4) * 100}%)`,
                              accentColor: dim.color,
                            }}
                          />
                          <div className="flex justify-between text-xs text-text-secondary mt-1">
                            {SCALE.map((s) => (
                              <span
                                key={s.val}
                                className={s.val === memberScore[dim.key] ? 'font-medium' : ''}
                                style={{ color: s.val === memberScore[dim.key] ? dim.color : undefined }}
                              >
                                {s.val}
                              </span>
                            ))}
                          </div>
                          <div className="text-center text-xs mt-1" style={{ color: dim.color }}>
                            {SCALE.find((s) => s.val === memberScore[dim.key])?.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-text-secondary">
                        Promedio estimado:{' '}
                        <span className="font-bold text-text-primary">
                          {(
                            (memberScore.apertura + memberScore.curiosidad + memberScore.influencia + memberScore.carga) / 4
                          ).toFixed(1)}
                          {' '}/ 5
                        </span>
                        {' '} → {' '}
                        <span style={{ color: getQuadrant(member.id)?.color }}>
                          {getQuadrant(member.id)?.label}
                        </span>
                      </div>
                      <button
                        onClick={() => saveEvaluation(member.id)}
                        disabled={saving[member.id]}
                        className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                        style={{
                          background: saved[member.id]
                            ? 'rgba(15, 110, 86, 0.8)'
                            : 'linear-gradient(135deg, #534AB7 0%, #6B62CC 100%)',
                        }}
                      >
                        {saving[member.id] ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Guardando...
                          </>
                        ) : saved[member.id] ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Guardado
                          </>
                        ) : (
                          'Guardar evaluación'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

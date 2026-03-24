'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { POSITIVE_SIGNALS, NEGATIVE_SIGNALS, calcProfileType, PROFILE_LABELS } from '@/lib/diagnostic'

interface LeaderData {
  user: { id: string; name: string; areaName: string | null; email: string }
  diagnostic: {
    positiveSignals: string[]
    negativeSignals: string[]
    note: string | null
    profileType: string | null
  } | null
}

export default function LeaderDiagnosticPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [data, setData] = useState<LeaderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [posChecked, setPosChecked] = useState<Set<string>>(new Set())
  const [negChecked, setNegChecked] = useState<Set<string>>(new Set())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/diagnostics/${userId}`).then((r) => r.json()),
      fetch(`/api/admin/area/${userId}`).then((r) => r.json()),
    ]).then(([diagnostic, areaData]) => {
      setData({ user: areaData.user, diagnostic })
      if (diagnostic) {
        setPosChecked(new Set(diagnostic.positiveSignals ?? []))
        setNegChecked(new Set(diagnostic.negativeSignals ?? []))
        setNote(diagnostic.note ?? '')
      }
      setLoading(false)
    })
  }, [userId])

  const togglePos = (key: string) => {
    setPosChecked((prev) => {
      const n = new Set(prev)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
    setSaved(false)
  }

  const toggleNeg = (key: string) => {
    setNegChecked((prev) => {
      const n = new Set(prev)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    await fetch(`/api/admin/diagnostics/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positiveSignals: Array.from(posChecked),
        negativeSignals: Array.from(negChecked),
        note,
      }),
    })
    setSaving(false)
    setSaved(true)
  }

  const profileType = calcProfileType(Array.from(posChecked), Array.from(negChecked))
  const profile = PROFILE_LABELS[profileType]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-10 h-10 border-2 border-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/admin/area/${userId}`}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-4 transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al área
        </Link>

        {/* Private badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: 'rgba(83, 74, 183, 0.15)', color: '#AFA9EC', border: '1px solid rgba(83, 74, 183, 0.3)' }}
        >
          🔒 Solo visible para ti — Diagnóstico privado
        </div>

        <h1 className="text-2xl font-bold text-text-primary">
          Diagnóstico del Líder
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {data.user.name} · {data.user.areaName}
        </p>
      </div>

      {/* Live profile preview */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-4"
        style={{ background: profile.bg, border: `1px solid ${profile.color}30` }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: `${profile.color}20`, color: profile.color }}
        >
          {posChecked.size > negChecked.size ? '✅' : negChecked.size > posChecked.size ? '⚠️' : '〰️'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-text-primary">Perfil: </span>
            <span className="font-bold text-base" style={{ color: profile.color }}>{profile.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${profile.color}20`, color: profile.color }}>
              {posChecked.size} positivas · {negChecked.size} negativas
            </span>
          </div>
          <p className="text-text-secondary text-xs mt-0.5">{profile.desc}</p>
        </div>
      </div>

      {/* Positive signals */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{ background: 'rgba(22, 19, 42, 0.8)', border: '1px solid rgba(30, 26, 56, 0.8)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-teal-mid" />
          <span className="text-sm font-semibold" style={{ color: '#5DCAA5' }}>
            Señales positivas — líder facilitador
          </span>
        </div>

        <div className="space-y-3">
          {POSITIVE_SIGNALS.map((sig) => {
            const isChecked = posChecked.has(sig.key)
            return (
              <div
                key={sig.key}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150"
                style={{
                  background: isChecked ? 'rgba(15, 110, 86, 0.12)' : 'rgba(14, 12, 30, 0.4)',
                  border: isChecked ? '1px solid rgba(93, 202, 165, 0.3)' : '1px solid transparent',
                }}
                onClick={() => togglePos(sig.key)}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    background: isChecked ? '#0F6E56' : 'transparent',
                    border: isChecked ? '1px solid #0F6E56' : '1.5px solid rgba(175, 169, 236, 0.3)',
                  }}
                >
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary leading-tight">{sig.title}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                      style={{ background: 'rgba(93, 202, 165, 0.15)', color: '#5DCAA5' }}
                    >
                      {sig.tag}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{sig.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Negative signals */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{ background: 'rgba(22, 19, 42, 0.8)', border: '1px solid rgba(30, 26, 56, 0.8)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: '#EF9F27' }} />
          <span className="text-sm font-semibold" style={{ color: '#EF9F27' }}>
            Señales de alerta — líder pasivo o resistente
          </span>
        </div>

        <div className="space-y-3">
          {NEGATIVE_SIGNALS.map((sig) => {
            const isChecked = negChecked.has(sig.key)
            return (
              <div
                key={sig.key}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150"
                style={{
                  background: isChecked ? 'rgba(186, 117, 23, 0.1)' : 'rgba(14, 12, 30, 0.4)',
                  border: isChecked ? '1px solid rgba(186, 117, 23, 0.3)' : '1px solid transparent',
                }}
                onClick={() => toggleNeg(sig.key)}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    background: isChecked ? '#BA7517' : 'transparent',
                    border: isChecked ? '1px solid #BA7517' : '1.5px solid rgba(175, 169, 236, 0.3)',
                  }}
                >
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary leading-tight">{sig.title}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                      style={{ background: 'rgba(186, 117, 23, 0.15)', color: '#EF9F27' }}
                    >
                      {sig.tag}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{sig.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Private note */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: 'rgba(22, 19, 42, 0.8)', border: '1px solid rgba(30, 26, 56, 0.8)' }}
      >
        <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
          🔒 Nota privada sobre este líder
        </label>
        <textarea
          value={note}
          onChange={(e) => { setNote(e.target.value); setSaved(false) }}
          placeholder="Ej: muy abierto, mencionar a Baudoin si hay resistencia, tiene a Pedro como potencial champion..."
          rows={3}
          className="w-full bg-bg1 border border-border rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-purple placeholder-text-secondary resize-none"
        />
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        <Link href={`/admin/area/${userId}`} className="btn-secondary">
          Ver informe completo del área
        </Link>
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
          style={{
            background: saved
              ? 'rgba(15, 110, 86, 0.8)'
              : 'linear-gradient(135deg, #534AB7 0%, #6B62CC 100%)',
          }}
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : saved ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Diagnóstico guardado
            </>
          ) : (
            'Guardar diagnóstico'
          )}
        </button>
      </div>
    </div>
  )
}

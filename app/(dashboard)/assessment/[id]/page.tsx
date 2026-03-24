'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CATEGORIES, SCALE_LABELS, INVERTED_SCALE_LABELS } from '@/lib/questions'
import Link from 'next/link'

interface AssessmentData {
  id: string
  status: string
  responses: Array<{ questionId: number; value: number }>
}

export default function AssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [currentCategory, setCurrentCategory] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Load existing assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`)
        if (!res.ok) throw new Error('No se pudo cargar la evaluación')
        const data = await res.json()

        if (data.status === 'COMPLETED') {
          router.push('/results')
          return
        }

        setAssessment(data)

        const existingResponses: Record<number, number> = {}
        for (const r of data.responses || []) {
          existingResponses[r.questionId] = r.value
        }
        setResponses(existingResponses)

        // Determine which category to start from
        if (data.responses?.length > 0) {
          const answeredQuestions = new Set(data.responses.map((r: any) => r.questionId))
          for (let i = 0; i < CATEGORIES.length; i++) {
            const categoryComplete = CATEGORIES[i].questions.every((q) => answeredQuestions.has(q.id))
            if (!categoryComplete) {
              setCurrentCategory(i)
              break
            }
            if (i === CATEGORIES.length - 1) {
              setCurrentCategory(i)
            }
          }
        }
      } catch (err) {
        setError('Error al cargar la evaluación')
      } finally {
        setLoading(false)
      }
    }

    loadAssessment()
  }, [assessmentId, router])

  const saveResponses = useCallback(
    async (newResponses: Record<number, number>, silent = false) => {
      if (!silent) setSaveStatus('saving')
      try {
        await fetch(`/api/assessments/${assessmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses: newResponses }),
        })
        if (!silent) {
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        }
      } catch (err) {
        console.error('Error saving responses:', err)
      }
    },
    [assessmentId]
  )

  const handleResponse = (questionId: number, value: number) => {
    const newResponses = { ...responses, [questionId]: value }
    setResponses(newResponses)
    saveResponses({ [questionId]: value }, true)
  }

  const currentCat = CATEGORIES[currentCategory]
  const currentQuestions = currentCat.questions

  const isCategoryComplete = currentQuestions.every((q) => responses[q.id] !== undefined)

  const totalAnswered = Object.keys(responses).length
  const progressPercent = (totalAnswered / 25) * 100

  const handleNext = async () => {
    if (!isCategoryComplete) return

    if (currentCategory < CATEGORIES.length - 1) {
      setSaving(true)
      await saveResponses(responses, true)
      setSaving(false)
      setCurrentCategory((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Complete the assessment
      setSubmitting(true)
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses, complete: true }),
        })

        if (!res.ok) throw new Error('Error al completar la evaluación')

        router.push('/results')
      } catch (err) {
        setError('Error al completar la evaluación. Intenta de nuevo.')
        setSubmitting(false)
      }
    }
  }

  const handlePrev = () => {
    if (currentCategory > 0) {
      setCurrentCategory((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Cargando evaluación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="card text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/dashboard" className="btn-secondary">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            {saveStatus === 'saving' && (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <svg className="w-3 h-3 text-teal-mid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-teal-mid">Guardado</span>
              </>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-text-primary">
          Diagnóstico de Madurez IA
        </h1>

        {/* Overall progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>{totalAnswered} de 25 preguntas respondidas</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat, idx) => {
            const catComplete = cat.questions.every((q) => responses[q.id] !== undefined)
            const isCurrent = idx === currentCategory
            return (
              <button
                key={cat.id}
                onClick={() => setCurrentCategory(idx)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: isCurrent
                    ? `${cat.color}25`
                    : catComplete
                    ? 'rgba(93, 202, 165, 0.1)'
                    : 'var(--bg3)',
                  border: isCurrent
                    ? `1px solid ${cat.color}50`
                    : catComplete
                    ? '1px solid rgba(93, 202, 165, 0.3)'
                    : '1px solid var(--border)',
                  color: isCurrent ? cat.color : catComplete ? 'var(--teal-mid)' : 'var(--text-secondary)',
                }}
              >
                {catComplete && !isCurrent && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {cat.shortName}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category header */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: `${currentCat.color}15`,
          border: `1px solid ${currentCat.color}30`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
            style={{
              background: `${currentCat.color}30`,
              color: currentCat.color,
              border: `1px solid ${currentCat.color}40`,
            }}
          >
            {currentCategory + 1}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{currentCat.name}</h2>
            <p className="text-text-secondary text-sm mt-1">{currentCat.description}</p>
            <p className="text-xs mt-2" style={{ color: currentCat.color }}>
              Categoría {currentCategory + 1} de {CATEGORIES.length}
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {currentQuestions.map((question, qIdx) => {
          const scaleLabels = question.isInverted ? INVERTED_SCALE_LABELS : SCALE_LABELS
          const selectedValue = responses[question.id]

          return (
            <div
              key={question.id}
              className="rounded-xl p-5 animate-slide-up"
              style={{
                background: 'var(--bg2)',
                border: selectedValue
                  ? `1px solid ${currentCat.color}30`
                  : '1px solid var(--border)',
                animationDelay: `${qIdx * 0.05}s`,
              }}
            >
              <div className="flex gap-3 mb-4">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: selectedValue ? `${currentCat.color}25` : 'var(--bg3)',
                    color: selectedValue ? currentCat.color : 'var(--text-secondary)',
                    border: selectedValue ? `1px solid ${currentCat.color}40` : '1px solid var(--border)',
                  }}
                >
                  {question.id}
                </span>
                <p className="text-text-primary font-medium leading-relaxed">
                  {question.text}
                  {question.isInverted && (
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded font-normal"
                      style={{
                        background: 'rgba(186, 117, 23, 0.15)',
                        color: '#EF9F27',
                        border: '1px solid rgba(186, 117, 23, 0.2)',
                      }}
                    >
                      Escala inversa
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleResponse(question.id, value)}
                    className={`radio-option flex-col text-center ${selectedValue === value ? 'selected' : ''}`}
                    style={{
                      borderColor: selectedValue === value ? currentCat.color : 'transparent',
                      background: selectedValue === value ? `${currentCat.color}15` : 'var(--bg3)',
                    }}
                  >
                    <span
                      className="text-xl font-bold mb-1"
                      style={{ color: selectedValue === value ? currentCat.color : 'var(--text-secondary)' }}
                    >
                      {value}
                    </span>
                    <span className="text-xs text-text-secondary leading-tight">
                      {scaleLabels[value]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentCategory === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <div className="text-text-secondary text-sm">
          {currentCategory + 1} / {CATEGORIES.length}
        </div>

        <button
          onClick={handleNext}
          disabled={!isCategoryComplete || submitting}
          className="btn-primary flex items-center gap-2"
          style={{
            background:
              !isCategoryComplete
                ? 'var(--purple-dark)'
                : currentCategory === CATEGORIES.length - 1
                ? 'linear-gradient(135deg, #0F6E56 0%, #5DCAA5 100%)'
                : 'linear-gradient(135deg, #534AB7 0%, #6B62CC 100%)',
          }}
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </>
          ) : currentCategory === CATEGORIES.length - 1 ? (
            <>
              Finalizar Evaluación
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              Siguiente
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {!isCategoryComplete && (
        <p className="text-center text-text-secondary text-xs mt-4">
          Responde todas las preguntas de esta categoría para continuar
          ({currentQuestions.filter((q) => responses[q.id] !== undefined).length}/{currentQuestions.length} respondidas)
        </p>
      )}

      {error && (
        <div
          className="mt-4 p-4 rounded-lg text-sm text-center"
          style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#FCA5A5' }}
        >
          {error}
        </div>
      )}
    </div>
  )
}

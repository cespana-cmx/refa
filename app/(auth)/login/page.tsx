'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos. Por favor verifica tus datos.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Ocurrió un error. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg1 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #534AB7 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #0F6E56 0%, transparent 70%)',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(83, 74, 183, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(83, 74, 183, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #534AB7 0%, #3D3589 100%)',
              boxShadow: '0 8px 32px rgba(83, 74, 183, 0.4)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="8" fill="white" opacity="0.9" />
              <circle cx="20" cy="8" r="4" fill="white" opacity="0.6" />
              <circle cx="20" cy="32" r="4" fill="white" opacity="0.6" />
              <circle cx="8" cy="20" r="4" fill="white" opacity="0.6" />
              <circle cx="32" cy="20" r="4" fill="white" opacity="0.6" />
              <line x1="20" y1="12" x2="20" y2="16" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <line x1="20" y1="24" x2="20" y2="28" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <line x1="12" y1="20" x2="16" y2="20" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <line x1="24" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1.5" opacity="0.6" />
            </svg>
          </div>

          <div className="mb-2">
            <span className="text-3xl font-bold" style={{ color: '#AFA9EC' }}>Ref</span>
            <span className="text-3xl font-bold text-white">ácil</span>
          </div>
          <h1 className="text-xl font-semibold text-text-primary mt-2">
            Diagnóstico de Madurez IA
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Accede a tu cuenta para continuar
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(22, 19, 42, 0.9)',
            border: '1px solid rgba(83, 74, 183, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@refacil.com"
                className="input-field"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="flex items-start gap-3 p-4 rounded-lg text-sm"
                style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  color: '#FCA5A5',
                }}
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? '#3D3589' : 'linear-gradient(135deg, #534AB7 0%, #6B62CC 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(83, 74, 183, 0.4)',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 pt-6 text-center text-xs"
            style={{
              borderTop: '1px solid rgba(83, 74, 183, 0.15)',
              color: '#9994CC',
            }}
          >
            ¿Problemas para acceder? Contacta al administrador
          </div>
        </div>

        <p className="text-center text-xs text-text-secondary mt-6 opacity-60">
          © 2024 Refácil · Herramienta de Diagnóstico IA
        </p>
      </div>
    </div>
  )
}

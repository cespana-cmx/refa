'use client'

import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light' | 'system'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? null : theme
  if (resolved) {
    document.documentElement.setAttribute('data-theme', resolved)
    localStorage.setItem('theme', resolved)
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem('theme')
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (stored) setTheme(stored)
    setResolved(getSystemTheme())

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setResolved(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const cycle = () => {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(next)
    applyTheme(next)
  }

  const effectiveTheme = theme === 'system' ? resolved : theme

  if (!mounted) return null

  return (
    <button
      onClick={cycle}
      title={`Tema: ${theme === 'system' ? 'automático' : theme}`}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg3)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {effectiveTheme === 'dark' ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
      <span>
        {effectiveTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      </span>
      {theme === 'system' && (
        <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>auto</span>
      )}
    </button>
  )
}

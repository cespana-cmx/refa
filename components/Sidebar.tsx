'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import ThemeToggle from './ThemeToggle'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/assessment/new',
    label: 'Nueva Evaluación',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/team',
    label: 'Mi Equipo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/results',
    label: 'Mis Resultados',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/admin',
    label: 'Panel Admin',
    adminOnly: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Gestionar Usuarios',
    adminOnly: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="p-6 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(83, 74, 183, 0.1)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #534AB7 0%, #3D3589 100%)',
            boxShadow: '0 4px 12px rgba(83, 74, 183, 0.3)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="8" fill="white" opacity="0.9" />
            <circle cx="20" cy="8" r="4" fill="white" opacity="0.5" />
            <circle cx="20" cy="32" r="4" fill="white" opacity="0.5" />
            <circle cx="8" cy="20" r="4" fill="white" opacity="0.5" />
            <circle cx="32" cy="20" r="4" fill="white" opacity="0.5" />
          </svg>
        </div>
        <div>
          <span className="font-bold text-lg" style={{ color: '#AFA9EC' }}>Ref</span>
          <span className="font-bold text-lg text-white">ácil</span>
          <p className="text-xs" style={{ color: '#9994CC' }}>Diagnóstico IA</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: '#534AB7' }}>
              General
            </p>
          </div>
        )}

        {visibleItems
          .filter((item) => !item.adminOnly)
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: '#534AB7' }}>
                Administración
              </p>
            </div>
            {visibleItems
              .filter((item) => item.adminOnly)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div
        className="p-4"
        style={{ borderTop: '1px solid rgba(83, 74, 183, 0.1)' }}
      >
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #534AB7, #0F6E56)',
              color: 'white',
            }}
          >
            {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-text-primary truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {isAdmin ? 'Administrador' : session?.user?.areaName || 'Usuario'}
            </p>
          </div>
        </div>

        <ThemeToggle />

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200"
          style={{
            color: '#9994CC',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'
            e.currentTarget.style.color = '#FCA5A5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#9994CC'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

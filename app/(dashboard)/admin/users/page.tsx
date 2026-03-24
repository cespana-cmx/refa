'use client'

import { useState, useEffect, FormEvent } from 'react'
import { getMaturityInfo, formatScore } from '@/lib/scoring'
import MaturityBadge from '@/components/MaturityBadge'

interface User {
  id: string
  name: string
  email: string
  role: string
  areaName: string | null
  createdAt: string
  _count: { assessments: number }
  assessments: Array<{
    id: string
    status: string
    score: number | null
    completedAt: string | null
  }>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    areaName: '',
  })

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      setError('Error al cargar la lista de usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear usuario')

      setSuccess(`Usuario ${form.name} creado exitosamente`)
      setShowModal(false)
      setForm({ name: '', email: '', password: '', role: 'USER', areaName: '' })
      await loadUsers()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
      return
    }

    setDeleting(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario')

      setSuccess(`Usuario ${userName} eliminado`)
      await loadUsers()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario')
    } finally {
      setDeleting(null)
    }
  }

  const regularUsers = users.filter((u) => u.role === 'USER')
  const adminUsers = users.filter((u) => u.role === 'ADMIN')

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gestión de Usuarios</h1>
          <p className="text-text-secondary mt-1">
            Administra los líderes de área y sus accesos
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError('') }}
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Success / Error messages */}
      {success && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{ background: 'rgba(15, 110, 86, 0.15)', border: '1px solid rgba(93, 202, 165, 0.25)', color: '#5DCAA5' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {error && !showModal && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#FCA5A5' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Líderes de Área</p>
              <p className="text-3xl font-bold text-text-primary">{regularUsers.length}</p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Han Evaluado</p>
              <p className="text-3xl font-bold text-text-primary">
                {regularUsers.filter((u) => u.assessments.some((a) => a.status === 'COMPLETED')).length}
              </p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Sin Evaluar</p>
              <p className="text-3xl font-bold text-text-primary">
                {regularUsers.filter((u) => !u.assessments.some((a) => a.status === 'COMPLETED')).length}
              </p>
            </div>
          </div>

          {/* Users table */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-text-primary">Líderes de Área ({regularUsers.length})</h3>
            </div>

            {regularUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">No hay usuarios registrados</p>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                  Crear primer usuario
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Área</th>
                      <th>Estado</th>
                      <th>Puntaje</th>
                      <th>Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularUsers.map((user) => {
                      const latestCompleted = user.assessments.find((a) => a.status === 'COMPLETED')
                      const hasDraft = user.assessments.some((a) => a.status === 'DRAFT')

                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{
                                  background: 'linear-gradient(135deg, #534AB7, #0F6E56)',
                                  color: 'white',
                                }}
                              >
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-text-primary">{user.name}</p>
                                <p className="text-text-secondary text-xs">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-text-secondary text-sm">
                              {user.areaName || '—'}
                            </span>
                          </td>
                          <td>
                            {latestCompleted ? (
                              <span
                                className="badge"
                                style={{
                                  background: 'rgba(15, 110, 86, 0.15)',
                                  color: '#5DCAA5',
                                  border: '1px solid rgba(93, 202, 165, 0.25)',
                                }}
                              >
                                Completado
                              </span>
                            ) : hasDraft ? (
                              <span
                                className="badge"
                                style={{
                                  background: 'rgba(186, 117, 23, 0.15)',
                                  color: '#EF9F27',
                                  border: '1px solid rgba(239, 159, 39, 0.25)',
                                }}
                              >
                                En Progreso
                              </span>
                            ) : (
                              <span
                                className="badge"
                                style={{
                                  background: 'rgba(83, 74, 183, 0.1)',
                                  color: '#9994CC',
                                  border: '1px solid rgba(83, 74, 183, 0.2)',
                                }}
                              >
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td>
                            {latestCompleted?.score ? (
                              <MaturityBadge
                                level={getMaturityInfo(latestCompleted.score).level}
                                score={latestCompleted.score}
                                size="sm"
                                showScore
                              />
                            ) : (
                              <span className="text-text-secondary text-sm">—</span>
                            )}
                          </td>
                          <td>
                            <span className="text-text-secondary text-sm">
                              {new Date(user.createdAt).toLocaleDateString('es-CO', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              disabled={deleting === user.id}
                              className="btn-danger text-xs px-3 py-1.5 disabled:opacity-50"
                            >
                              {deleting === user.id ? (
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                'Eliminar'
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Admin users */}
          {adminUsers.length > 0 && (
            <div className="card mt-6">
              <h3 className="font-semibold text-text-primary mb-4">Administradores ({adminUsers.length})</h3>
              <div className="space-y-2">
                {adminUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{ background: 'rgba(83, 74, 183, 0.1)', border: '1px solid rgba(83, 74, 183, 0.2)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: '#534AB7', color: 'white' }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">{user.name}</p>
                      <p className="text-text-secondary text-xs">{user.email}</p>
                    </div>
                    <span
                      className="badge ml-auto"
                      style={{
                        background: 'rgba(83, 74, 183, 0.2)',
                        color: '#AFA9EC',
                        border: '1px solid rgba(83, 74, 183, 0.3)',
                      }}
                    >
                      Administrador
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create user modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(14, 12, 30, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 animate-slide-up"
            style={{
              background: '#16132A',
              border: '1px solid rgba(83, 74, 183, 0.3)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Nuevo Usuario</h2>
              <button
                onClick={() => { setShowModal(false); setError('') }}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Nombre completo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="María González"
                  required
                />
              </div>

              <div>
                <label className="label">Correo electrónico *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="maria@refacil.com"
                  required
                />
              </div>

              <div>
                <label className="label">Contraseña *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label className="label">Área / Departamento</label>
                <input
                  type="text"
                  value={form.areaName}
                  onChange={(e) => setForm({ ...form, areaName: e.target.value })}
                  className="input-field"
                  placeholder="Recursos Humanos"
                />
              </div>

              <div>
                <label className="label">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field"
                >
                  <option value="USER">Líder de Área</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#FCA5A5' }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError('') }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creando...
                    </>
                  ) : (
                    'Crear Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

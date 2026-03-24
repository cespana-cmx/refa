import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: list all leader diagnostics (admin only)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const diagnostics = await prisma.leaderDiagnostic.findMany({
    include: { user: { select: { id: true, name: true, email: true, areaName: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(diagnostics)
}

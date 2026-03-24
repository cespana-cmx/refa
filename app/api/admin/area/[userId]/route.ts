import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: full area data for admin view (assessment + team + diagnostic)
export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [user, assessment, teamMembers, diagnostic] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, name: true, email: true, areaName: true, createdAt: true },
    }),
    prisma.assessment.findFirst({
      where: { userId: params.userId, status: 'COMPLETED' },
      include: { responses: true },
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

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ user, assessment, teamMembers, diagnostic })
}

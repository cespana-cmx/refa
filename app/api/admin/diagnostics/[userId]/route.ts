import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcProfileType } from '@/lib/diagnostic'

// GET: get diagnostic for a specific leader
export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const diagnostic = await prisma.leaderDiagnostic.findUnique({
    where: { userId: params.userId },
    include: { user: { select: { id: true, name: true, email: true, areaName: true } } },
  })

  return NextResponse.json(diagnostic)
}

// PUT: create or update diagnostic for a specific leader
export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { positiveSignals, negativeSignals, note } = await req.json()

  const profileType = calcProfileType(positiveSignals ?? [], negativeSignals ?? [])

  const diagnostic = await prisma.leaderDiagnostic.upsert({
    where: { userId: params.userId },
    update: { positiveSignals, negativeSignals, note, profileType },
    create: { userId: params.userId, positiveSignals, negativeSignals, note, profileType },
  })

  return NextResponse.json(diagnostic)
}

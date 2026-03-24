import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const assessments = await prisma.assessment.findMany({
      where: { userId: session.user.id },
      include: {
        responses: true,
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('GET /api/assessments error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if there's already a draft assessment
    const existingDraft = await prisma.assessment.findFirst({
      where: {
        userId: session.user.id,
        status: 'DRAFT',
      },
    })

    if (existingDraft) {
      return NextResponse.json(existingDraft)
    }

    const assessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error('POST /api/assessments error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

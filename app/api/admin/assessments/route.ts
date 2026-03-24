import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const assessments = await prisma.assessment.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, areaName: true },
        },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('GET /api/admin/assessments error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

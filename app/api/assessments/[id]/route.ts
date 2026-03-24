import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateScore } from '@/lib/scoring'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: params.id,
        ...(session.user.role !== 'ADMIN' ? { userId: session.user.id } : {}),
      },
      include: {
        responses: true,
        user: {
          select: { id: true, name: true, email: true, areaName: true },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('GET /api/assessments/[id] error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { responses, complete } = body

    const assessment = await prisma.assessment.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    if (assessment.status === 'COMPLETED') {
      return NextResponse.json({ error: 'La evaluación ya fue completada' }, { status: 400 })
    }

    // Upsert responses
    if (responses && typeof responses === 'object') {
      for (const [questionId, value] of Object.entries(responses)) {
        await prisma.response.upsert({
          where: {
            assessmentId_questionId: {
              assessmentId: params.id,
              questionId: parseInt(questionId),
            },
          },
          update: { value: Number(value) },
          create: {
            assessmentId: params.id,
            questionId: parseInt(questionId),
            value: Number(value),
          },
        })
      }
    }

    // Complete the assessment
    if (complete) {
      const allResponses = await prisma.response.findMany({
        where: { assessmentId: params.id },
      })

      const responsesMap: Record<number, number> = {}
      for (const r of allResponses) {
        responsesMap[r.questionId] = r.value
      }

      const scoreResult = calculateScore(responsesMap)

      const updated = await prisma.assessment.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          score: scoreResult.overall,
          categoryScores: scoreResult.categories as any,
          completedAt: new Date(),
        },
        include: { responses: true },
      })

      return NextResponse.json(updated)
    }

    const updated = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: { responses: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/assessments/[id] error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

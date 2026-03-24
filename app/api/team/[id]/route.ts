import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE: remove team member
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await prisma.teamMember.findUnique({ where: { id: params.id } })
  if (!member || member.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.teamMember.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

// PATCH: save or update evaluation for a member
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await prisma.teamMember.findUnique({ where: { id: params.id } })
  if (!member || member.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { apertura, curiosidad, influencia, carga } = await req.json()

  const evaluation = await prisma.teamEvaluation.upsert({
    where: { memberId: params.id },
    update: { apertura, curiosidad, influencia, carga },
    create: { memberId: params.id, apertura, curiosidad, influencia, carga },
  })

  return NextResponse.json(evaluation)
}

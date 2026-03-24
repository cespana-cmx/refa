import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: list team members with evaluations for current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const members = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: { evaluation: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(members)
}

// POST: add team member
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  const member = await prisma.teamMember.create({
    data: { userId: session.user.id, name: name.trim() },
    include: { evaluation: true },
  })

  return NextResponse.json(member)
}

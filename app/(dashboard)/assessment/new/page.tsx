import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function NewAssessmentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  // Check for existing draft
  const existingDraft = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: 'DRAFT' },
  })

  if (existingDraft) {
    redirect(`/assessment/${existingDraft.id}`)
  }

  // Create new assessment
  const assessment = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      status: 'DRAFT',
    },
  })

  redirect(`/assessment/${assessment.id}`)
}

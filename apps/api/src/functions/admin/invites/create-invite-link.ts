import crypto from 'node:crypto'
import { courses, creators, db, inviteTokens } from '@ybr/database'
import { and, eq } from 'drizzle-orm'

interface CreateInviteLinkParams {
  courseId: string
  creatorId: string
  expiresAt?: Date
}

interface InviteLinkResult {
  id: string
  token: string
  courseId: string
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
}

const createInviteLink = async ({
  courseId,
  creatorId,
  expiresAt,
}: CreateInviteLinkParams): Promise<InviteLinkResult> => {
  // Verify course belongs to creator
  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .innerJoin(creators, eq(courses.creatorId, creators.id))
    .where(and(eq(courses.id, courseId), eq(creators.id, creatorId)))
    .limit(1)

  if (!course) {
    const error = new Error('Course not found') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 404
    error.code = 'COURSE_NOT_FOUND'
    throw error
  }

  const token = crypto.randomBytes(32).toString('hex')

  const [created] = await db
    .insert(inviteTokens)
    .values({
      courseId,
      creatorId,
      token,
      expiresAt: expiresAt ?? null,
      isActive: true,
    })
    .returning()

  if (!created) {
    throw new Error('Failed to create invite link')
  }

  return {
    id: created.id,
    token: created.token,
    courseId: created.courseId,
    expiresAt: created.expiresAt,
    isActive: created.isActive,
    createdAt: created.createdAt,
  }
}

export type { CreateInviteLinkParams, InviteLinkResult }
export { createInviteLink }

import { courses, creators, db, inviteTokens, users } from '@ybr/database'
import { eq } from 'drizzle-orm'

interface GetInviteTokenInfoParams {
  token: string
}

interface InviteTokenInfo {
  token: string
  courseId: string
  courseTitle: string
  creatorName: string
  expiresAt: Date | null
}

const getInviteTokenInfo = async ({
  token,
}: GetInviteTokenInfoParams): Promise<InviteTokenInfo> => {
  const [invite] = await db
    .select({
      token: inviteTokens.token,
      courseId: inviteTokens.courseId,
      courseTitle: courses.title,
      creatorName: users.name,
      expiresAt: inviteTokens.expiresAt,
      isActive: inviteTokens.isActive,
    })
    .from(inviteTokens)
    .innerJoin(courses, eq(inviteTokens.courseId, courses.id))
    .innerJoin(creators, eq(inviteTokens.creatorId, creators.id))
    .innerJoin(users, eq(creators.userId, users.id))
    .where(eq(inviteTokens.token, token))
    .limit(1)

  if (!invite) {
    const error = new Error('Invite link not found') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 404
    error.code = 'INVITE_NOT_FOUND'
    throw error
  }

  if (!invite.isActive) {
    const error = new Error('Invite link is no longer active') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 410
    error.code = 'INVITE_REVOKED'
    throw error
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    const error = new Error('Invite link has expired') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 410
    error.code = 'INVITE_EXPIRED'
    throw error
  }

  return {
    token: invite.token,
    courseId: invite.courseId,
    courseTitle: invite.courseTitle,
    creatorName: invite.creatorName,
    expiresAt: invite.expiresAt,
  }
}

export type { GetInviteTokenInfoParams, InviteTokenInfo }
export { getInviteTokenInfo }

import { courses, creators, db, enrollments, users } from '@ybr/database'
import { and, count, eq } from 'drizzle-orm'

interface CreatorDetail {
  id: string
  userId: string
  name: string
  email: string
  plan: string
  bio: string | null
  website: string | null
  activeCourses: number
  activeStudents: number
  createdAt: Date
}

const getCreator = async (creatorId: string): Promise<CreatorDetail> => {
  const [creator] = await db
    .select({
      id: creators.id,
      userId: creators.userId,
      name: users.name,
      email: users.email,
      plan: creators.plan,
      bio: creators.bio,
      website: creators.website,
      createdAt: creators.createdAt,
    })
    .from(creators)
    .innerJoin(users, eq(creators.userId, users.id))
    .where(eq(creators.id, creatorId))
    .limit(1)

  if (!creator) {
    const error = new Error('Creator not found') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 404
    error.code = 'CREATOR_NOT_FOUND'
    throw error
  }

  const [courseCountRow] = await db
    .select({ value: count() })
    .from(courses)
    .where(and(eq(courses.creatorId, creatorId), eq(courses.status, 'published')))

  const [studentCountRow] = await db
    .select({ value: count() })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(courses.creatorId, creatorId), eq(enrollments.status, 'active')))

  return {
    id: creator.id,
    userId: creator.userId,
    name: creator.name,
    email: creator.email,
    plan: creator.plan,
    bio: creator.bio,
    website: creator.website,
    activeCourses: courseCountRow?.value ?? 0,
    activeStudents: studentCountRow?.value ?? 0,
    createdAt: creator.createdAt,
  }
}

export type { CreatorDetail }
export { getCreator }

import { courses, creators, db, enrollments } from '@ybr/database'
import { and, eq } from 'drizzle-orm'

interface RevokeEnrollmentParams {
  enrollmentId: string
  creatorId: string
}

const revokeEnrollment = async ({
  enrollmentId,
  creatorId,
}: RevokeEnrollmentParams): Promise<void> => {
  const [enrollment] = await db
    .select({ id: enrollments.id, status: enrollments.status })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(creators, eq(courses.creatorId, creators.id))
    .where(and(eq(enrollments.id, enrollmentId), eq(creators.id, creatorId)))
    .limit(1)

  if (!enrollment) {
    const error = new Error('Enrollment not found') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 404
    error.code = 'ENROLLMENT_NOT_FOUND'
    throw error
  }

  await db.update(enrollments).set({ status: 'revoked' }).where(eq(enrollments.id, enrollmentId))
}

export type { RevokeEnrollmentParams }
export { revokeEnrollment }

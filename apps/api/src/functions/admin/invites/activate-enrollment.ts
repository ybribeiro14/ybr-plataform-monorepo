import { courses, creators, db, enrollments, users } from '@ybr/database'
import { and, eq } from 'drizzle-orm'
import { sendCourseAccessEmail } from '../../../infrastructure/email/enrollment-emails'

interface ActivateEnrollmentParams {
  enrollmentId: string
  creatorId: string
}

interface ActivatedEnrollmentResult {
  enrollmentId: string
  userId: string
  courseId: string
  status: 'active'
}

const activateEnrollment = async ({
  enrollmentId,
  creatorId,
}: ActivateEnrollmentParams): Promise<ActivatedEnrollmentResult> => {
  // Verify enrollment belongs to a course owned by this creator
  const [enrollment] = await db
    .select({
      id: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,
      status: enrollments.status,
      studentName: users.name,
      studentEmail: users.email,
      courseTitle: courses.title,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
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

  if (enrollment.status === 'active') {
    return {
      enrollmentId: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      status: 'active',
    }
  }

  if (enrollment.status === 'revoked') {
    const error = new Error('Cannot activate a revoked enrollment') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 400
    error.code = 'ENROLLMENT_REVOKED'
    throw error
  }

  await db.update(enrollments).set({ status: 'active' }).where(eq(enrollments.id, enrollmentId))

  // Send course access email (non-blocking)
  sendCourseAccessEmail(
    enrollment.studentEmail,
    enrollment.studentName,
    enrollment.courseTitle
  ).catch(err => {
    // biome-ignore lint/suspicious/noConsole: non-blocking error logging
    console.error('[Email] Failed to send course access email:', err)
  })

  return {
    enrollmentId: enrollment.id,
    userId: enrollment.userId,
    courseId: enrollment.courseId,
    status: 'active',
  }
}

export type { ActivatedEnrollmentResult, ActivateEnrollmentParams }
export { activateEnrollment }

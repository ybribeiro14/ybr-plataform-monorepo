import { courses, creators, db, enrollments, users } from '@ybr/database'
import { and, eq } from 'drizzle-orm'

interface ListPendingEnrollmentsParams {
  creatorId: string
}

interface PendingEnrollmentItem {
  id: string
  userId: string
  studentName: string
  studentEmail: string
  courseId: string
  courseTitle: string
  status: string
  enrolledAt: Date
}

const listPendingEnrollments = async ({
  creatorId,
}: ListPendingEnrollmentsParams): Promise<PendingEnrollmentItem[]> => {
  const results = await db
    .select({
      id: enrollments.id,
      userId: enrollments.userId,
      studentName: users.name,
      studentEmail: users.email,
      courseId: enrollments.courseId,
      courseTitle: courses.title,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(creators, eq(courses.creatorId, creators.id))
    .where(and(eq(creators.id, creatorId), eq(enrollments.status, 'pending')))

  return results.map(r => ({
    id: r.id,
    userId: r.userId,
    studentName: r.studentName,
    studentEmail: r.studentEmail,
    courseId: r.courseId,
    courseTitle: r.courseTitle,
    status: r.status,
    enrolledAt: r.enrolledAt,
  }))
}

export type { ListPendingEnrollmentsParams, PendingEnrollmentItem }
export { listPendingEnrollments }

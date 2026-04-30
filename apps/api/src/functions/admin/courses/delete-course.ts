import { courses, db } from '@ybr/database'
import { and, eq } from 'drizzle-orm'

interface DeleteCourseParams {
  courseId: string
  creatorId: string
}

const deleteCourse = async ({ courseId, creatorId }: DeleteCourseParams) => {
  const [existing] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.creatorId, creatorId)))
    .limit(1)

  if (!existing) {
    const error = new Error('Course not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'COURSE_NOT_FOUND'
    throw error
  }

  await db
    .update(courses)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(courses.id, courseId))
}

export type { DeleteCourseParams }
export { deleteCourse }

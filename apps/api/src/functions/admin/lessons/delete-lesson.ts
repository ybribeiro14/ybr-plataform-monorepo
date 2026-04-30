import { courseModules, courses, db, lessons } from '@ybr/database'
import { eq } from 'drizzle-orm'

interface DeleteLessonParams {
  lessonId: string
  creatorId: string
}

const deleteLesson = async ({ lessonId, creatorId }: DeleteLessonParams) => {
  const [lessonWithCourse] = await db
    .select({ id: lessons.id, creatorId: courses.creatorId })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(eq(lessons.id, lessonId))
    .limit(1)

  if (!lessonWithCourse || lessonWithCourse.creatorId !== creatorId) {
    const error = new Error('Lesson not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'LESSON_NOT_FOUND'
    throw error
  }

  await db.delete(lessons).where(eq(lessons.id, lessonId))
}

export type { DeleteLessonParams }
export { deleteLesson }

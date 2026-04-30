import { courseModules, courses, db, lessons } from '@ybr/database'
import type { CreateLessonInput } from '@ybr/schemas'
import { eq, max } from 'drizzle-orm'

interface CreateLessonParams extends CreateLessonInput {
  moduleId: string
  creatorId: string
}

const createLesson = async ({
  moduleId,
  creatorId,
  title,
  description,
  position,
  isFreePreview,
}: CreateLessonParams) => {
  const [moduleWithCourse] = await db
    .select({ id: courseModules.id, creatorId: courses.creatorId })
    .from(courseModules)
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(eq(courseModules.id, moduleId))
    .limit(1)

  if (!moduleWithCourse || moduleWithCourse.creatorId !== creatorId) {
    const error = new Error('Module not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'MODULE_NOT_FOUND'
    throw error
  }

  let resolvedPosition = position

  if (resolvedPosition === undefined) {
    const [maxResult] = await db
      .select({ maxPosition: max(lessons.position) })
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId))

    resolvedPosition = (maxResult?.maxPosition ?? -1) + 1
  }

  const [lesson] = await db
    .insert(lessons)
    .values({
      moduleId,
      title,
      description,
      position: resolvedPosition,
      isFreePreview: isFreePreview ?? false,
    })
    .returning()

  return lesson
}

export type { CreateLessonParams }
export { createLesson }

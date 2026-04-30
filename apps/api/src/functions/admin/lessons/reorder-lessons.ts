import { courseModules, courses, db, lessons } from '@ybr/database'
import { and, eq, inArray } from 'drizzle-orm'

interface LessonOrder {
  id: string
  position: number
}

interface ReorderLessonsParams {
  lessons: LessonOrder[]
  creatorId: string
}

const reorderLessons = async ({ lessons: lessonOrders, creatorId }: ReorderLessonsParams) => {
  if (lessonOrders.length === 0) return []

  const lessonIds = lessonOrders.map(l => l.id)

  // Verify ownership: all lessons must belong to a module owned by this creator
  const ownedLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(and(inArray(lessons.id, lessonIds), eq(courses.creatorId, creatorId)))

  if (ownedLessons.length !== lessonOrders.length) {
    const error = new Error('One or more lessons not found or access denied')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 403
    ;(error as Error & { statusCode: number; code: string }).code = 'INSUFFICIENT_PERMISSIONS'
    throw error
  }

  await Promise.all(
    lessonOrders.map(({ id, position }) =>
      db.update(lessons).set({ position, updatedAt: new Date() }).where(eq(lessons.id, id))
    )
  )

  return lessonOrders
}

export type { LessonOrder, ReorderLessonsParams }
export { reorderLessons }

import { courseModules, courses, db } from '@ybr/database'
import { eq } from 'drizzle-orm'

interface DeleteModuleParams {
  moduleId: string
  creatorId: string
}

const deleteModule = async ({ moduleId, creatorId }: DeleteModuleParams) => {
  const [existing] = await db
    .select({ id: courseModules.id, courseId: courseModules.courseId })
    .from(courseModules)
    .where(eq(courseModules.id, moduleId))
    .limit(1)

  if (!existing) {
    const error = new Error('Module not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'MODULE_NOT_FOUND'
    throw error
  }

  const [course] = await db
    .select({ id: courses.id, creatorId: courses.creatorId })
    .from(courses)
    .where(eq(courses.id, existing.courseId))
    .limit(1)

  if (!course || course.creatorId !== creatorId) {
    const error = new Error('Module not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'MODULE_NOT_FOUND'
    throw error
  }

  await db.delete(courseModules).where(eq(courseModules.id, moduleId))
}

export type { DeleteModuleParams }
export { deleteModule }

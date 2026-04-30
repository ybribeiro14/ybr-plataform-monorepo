import { courseModules, courses, db } from '@ybr/database'
import { and, eq, inArray } from 'drizzle-orm'

interface ModuleOrder {
  id: string
  position: number
}

interface ReorderModulesParams {
  modules: ModuleOrder[]
  creatorId: string
}

const reorderModules = async ({ modules: moduleOrders, creatorId }: ReorderModulesParams) => {
  if (moduleOrders.length === 0) return []

  const moduleIds = moduleOrders.map(m => m.id)

  const ownedModules = await db
    .select({ id: courseModules.id })
    .from(courseModules)
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(and(inArray(courseModules.id, moduleIds), eq(courses.creatorId, creatorId)))

  if (ownedModules.length !== moduleOrders.length) {
    const error = new Error('One or more modules not found or access denied')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 403
    ;(error as Error & { statusCode: number; code: string }).code = 'INSUFFICIENT_PERMISSIONS'
    throw error
  }

  await Promise.all(
    moduleOrders.map(({ id, position }) =>
      db
        .update(courseModules)
        .set({ position, updatedAt: new Date() })
        .where(eq(courseModules.id, id))
    )
  )

  return moduleOrders
}

export type { ModuleOrder, ReorderModulesParams }
export { reorderModules }

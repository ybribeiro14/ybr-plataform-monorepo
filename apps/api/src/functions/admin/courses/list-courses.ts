import { courseModules, courses, db, lessons } from '@ybr/database'
import { eq, sql } from 'drizzle-orm'

interface ListCoursesParams {
  creatorId: string
}

const listCourses = async ({ creatorId }: ListCoursesParams) => {
  const result = await db
    .select({
      id: courses.id,
      creatorId: courses.creatorId,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      thumbnailUrl: courses.thumbnailUrl,
      priceCents: courses.priceCents,
      currency: courses.currency,
      status: courses.status,
      language: courses.language,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      moduleCount: sql<number>`count(distinct ${courseModules.id})::int`,
      lessonCount: sql<number>`count(distinct ${lessons.id})::int`,
    })
    .from(courses)
    .leftJoin(courseModules, eq(courseModules.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .where(eq(courses.creatorId, creatorId))
    .groupBy(courses.id)
    .orderBy(courses.createdAt)

  return result
}

export type { ListCoursesParams }
export { listCourses }

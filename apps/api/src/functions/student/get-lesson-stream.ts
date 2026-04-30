import { courseModules, courses, db, enrollments, lessonProgress, lessons } from '@ybr/database'
import { and, eq } from 'drizzle-orm'

interface GetLessonStreamParams {
  lessonId: string
  userId: string
}

const getLessonStream = async ({ lessonId, userId }: GetLessonStreamParams) => {
  const [row] = await db
    .select({
      lessonId: lessons.id,
      title: lessons.title,
      bunnyVideoId: lessons.bunnyVideoId,
      durationSeconds: lessons.durationSeconds,
      courseId: courses.id,
      thumbnailUrl: courses.thumbnailUrl,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(eq(lessons.id, lessonId))
    .limit(1)

  if (!row) {
    const error = new Error('Lesson not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'LESSON_NOT_FOUND'
    throw error
  }

  const [enrollment] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, row.courseId),
        eq(enrollments.status, 'active')
      )
    )
    .limit(1)

  if (!enrollment) {
    const error = new Error('Not enrolled in this course')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 403
    ;(error as Error & { statusCode: number; code: string }).code = 'NOT_ENROLLED'
    throw error
  }

  if (!row.bunnyVideoId) {
    const error = new Error('Video not available for this lesson')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'VIDEO_NOT_AVAILABLE'
    throw error
  }

  const pullZoneUrl = (process.env.BUNNY_VIDEO_PULL_ZONE_URL ?? '').replace(/\/$/, '')
  const streamUrl = `${pullZoneUrl}/${row.bunnyVideoId}/playlist.m3u8`

  const [progress] = await db
    .select({
      watchedSeconds: lessonProgress.watchedSeconds,
      completedAt: lessonProgress.completedAt,
    })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1)

  return {
    lessonId: row.lessonId,
    title: row.title,
    streamUrl,
    thumbnailUrl: row.thumbnailUrl,
    durationSeconds: row.durationSeconds,
    progress: progress
      ? {
          watchedSeconds: progress.watchedSeconds,
          completed: progress.completedAt !== null,
        }
      : null,
  }
}

export type { GetLessonStreamParams }
export { getLessonStream }

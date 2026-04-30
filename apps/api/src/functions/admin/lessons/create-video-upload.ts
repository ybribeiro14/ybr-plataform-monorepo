import { courseModules, courses, db, lessons } from '@ybr/database'
import { eq } from 'drizzle-orm'
import { createBunnyVideo } from '../../../infrastructure/video/bunny'

interface CreateVideoUploadParams {
  lessonId: string
  creatorId: string
}

const createVideoUpload = async ({ lessonId, creatorId }: CreateVideoUploadParams) => {
  const [lessonWithCourse] = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      creatorId: courses.creatorId,
    })
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

  const credentials = await createBunnyVideo(lessonWithCourse.title)

  await db
    .update(lessons)
    .set({ bunnyVideoId: credentials.videoId, updatedAt: new Date() })
    .where(eq(lessons.id, lessonId))

  return credentials
}

export type { CreateVideoUploadParams }
export { createVideoUpload }

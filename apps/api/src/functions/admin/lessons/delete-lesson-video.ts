import { courseModules, courses, db, lessons } from '@ybr/database'
import { eq } from 'drizzle-orm'
import { deleteBunnyVideo } from '../../../infrastructure/video/bunny'

const BUNNY_LIBRARY_ID = process.env.BUNNY_VIDEO_LIBRARY_ID ?? ''

interface DeleteLessonVideoParams {
  lessonId: string
  creatorId: string
}

const deleteLessonVideo = async ({
  lessonId,
  creatorId,
}: DeleteLessonVideoParams): Promise<void> => {
  const [lessonWithCourse] = await db
    .select({
      id: lessons.id,
      bunnyVideoId: lessons.bunnyVideoId,
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

  if (!lessonWithCourse.bunnyVideoId) {
    const error = new Error('No video associated with this lesson')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'VIDEO_NOT_FOUND'
    throw error
  }

  try {
    await deleteBunnyVideo(lessonWithCourse.bunnyVideoId, BUNNY_LIBRARY_ID)
  } catch {
    // Video may have already been deleted on Bunny's side; continue cleanup
  }

  await db
    .update(lessons)
    .set({ bunnyVideoId: null, updatedAt: new Date() })
    .where(eq(lessons.id, lessonId))
}

export type { DeleteLessonVideoParams }
export { deleteLessonVideo }

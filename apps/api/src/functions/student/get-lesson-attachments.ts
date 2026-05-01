import { courseModules, courses, db, enrollments, lessonAttachments, lessons } from '@ybr/database'
import { and, eq } from 'drizzle-orm'

interface GetLessonAttachmentsParams {
  lessonId: string
  userId: string
}

interface LessonAttachment {
  id: string
  title: string
  fileUrl: string
  fileType: string
  fileSizeBytes: number | null
}

const getLessonAttachments = async ({
  lessonId,
  userId,
}: GetLessonAttachmentsParams): Promise<LessonAttachment[]> => {
  const [lessonRow] = await db
    .select({ courseId: courses.id })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(eq(lessons.id, lessonId))
    .limit(1)

  if (!lessonRow) {
    const error = new Error('Lesson not found') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 404
    error.code = 'LESSON_NOT_FOUND'
    throw error
  }

  const [enrollment] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, lessonRow.courseId),
        eq(enrollments.status, 'active')
      )
    )
    .limit(1)

  if (!enrollment) {
    const error = new Error('Not enrolled in this course') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 403
    error.code = 'NOT_ENROLLED'
    throw error
  }

  const attachments = await db
    .select({
      id: lessonAttachments.id,
      title: lessonAttachments.title,
      fileUrl: lessonAttachments.fileUrl,
      fileType: lessonAttachments.fileType,
      fileSizeBytes: lessonAttachments.fileSizeBytes,
    })
    .from(lessonAttachments)
    .where(eq(lessonAttachments.lessonId, lessonId))

  return attachments
}

export type { GetLessonAttachmentsParams, LessonAttachment }
export { getLessonAttachments }

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { courses, db } from '@ybr/database'
import { and, eq } from 'drizzle-orm'
import { R2_BUCKET, R2_PUBLIC_URL, r2 } from '../../../infrastructure/storage/r2'

interface UploadThumbnailParams {
  courseId: string
  creatorId: string
  buffer: Buffer
  mimeType: string
  extension: string
}

const uploadThumbnail = async ({
  courseId,
  creatorId,
  buffer,
  mimeType,
  extension,
}: UploadThumbnailParams) => {
  const [existing] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.creatorId, creatorId)))
    .limit(1)

  if (!existing) {
    const error = new Error('Course not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'COURSE_NOT_FOUND'
    throw error
  }

  if (!r2) {
    const error = new Error('File storage is not configured')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 503
    ;(error as Error & { statusCode: number; code: string }).code = 'STORAGE_NOT_CONFIGURED'
    throw error
  }

  const key = `thumbnails/${courseId}/${Date.now()}.${extension}`

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  )

  const thumbnailUrl = `${R2_PUBLIC_URL}/${key}`

  await db
    .update(courses)
    .set({ thumbnailUrl, updatedAt: new Date() })
    .where(eq(courses.id, courseId))

  return { thumbnailUrl }
}

export type { UploadThumbnailParams }
export { uploadThumbnail }

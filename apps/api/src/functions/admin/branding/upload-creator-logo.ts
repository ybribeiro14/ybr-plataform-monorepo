import { PutObjectCommand } from '@aws-sdk/client-s3'
import { creators, db } from '@ybr/database'
import { eq } from 'drizzle-orm'
import { R2_BUCKET, R2_PUBLIC_URL, r2 } from '../../../infrastructure/storage/r2'

interface UploadCreatorLogoParams {
  userId: string
  buffer: Buffer
  mimeType: string
}

// Logo spec: PNG with transparency or SVG
// Min: 400×120px recommended, Max: 2MB
// Stored as PNG (original format preserved)
const ALLOWED_MIME_TYPES = ['image/png', 'image/svg+xml']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

const uploadCreatorLogo = async ({ userId, buffer, mimeType }: UploadCreatorLogoParams) => {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    const error = new Error('Invalid file type. Logo must be PNG (with transparency) or SVG')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 400
    ;(error as Error & { statusCode: number; code: string }).code = 'INVALID_FILE_TYPE'
    throw error
  }

  if (buffer.length > MAX_SIZE_BYTES) {
    const error = new Error('Logo too large. Maximum size is 2 MB')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 400
    ;(error as Error & { statusCode: number; code: string }).code = 'FILE_TOO_LARGE'
    throw error
  }

  const [creator] = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.userId, userId))
    .limit(1)

  if (!creator) {
    const error = new Error('Creator not found')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 404
    ;(error as Error & { statusCode: number; code: string }).code = 'CREATOR_NOT_FOUND'
    throw error
  }

  if (!r2) {
    const error = new Error('File storage is not configured')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 503
    ;(error as Error & { statusCode: number; code: string }).code = 'STORAGE_NOT_CONFIGURED'
    throw error
  }

  const extension = mimeType === 'image/svg+xml' ? 'svg' : 'png'
  const key = `logos/creators/${creator.id}.${extension}`

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  )

  const logoUrl = `${R2_PUBLIC_URL}/${key}`

  await db
    .update(creators)
    .set({ logoUrl, updatedAt: new Date() })
    .where(eq(creators.id, creator.id))

  return { logoUrl }
}

export type { UploadCreatorLogoParams }
export { uploadCreatorLogo }

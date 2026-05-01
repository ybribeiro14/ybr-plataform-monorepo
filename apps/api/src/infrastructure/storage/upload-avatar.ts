import { PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { R2_BUCKET, R2_PUBLIC_URL, r2 } from './r2'

const AVATAR_SIZE = 400
const WEBP_QUALITY = 85

const uploadAvatarToR2 = async ({
  imageBuffer,
  userId,
}: {
  imageBuffer: Buffer
  userId: string
}): Promise<string> => {
  if (!r2) {
    throw new Error('R2 storage is not configured')
  }

  const webpBuffer = await sharp(imageBuffer)
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', position: 'centre' })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  const key = `avatars/${userId}.webp`

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  return `${R2_PUBLIC_URL}/${key}`
}

const deleteAvatarFromR2 = async (userId: string): Promise<void> => {
  if (!r2) return

  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
  const key = `avatars/${userId}.webp`

  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
}

export { deleteAvatarFromR2, uploadAvatarToR2 }

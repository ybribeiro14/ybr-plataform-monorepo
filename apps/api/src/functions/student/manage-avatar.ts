import { db, users } from '@ybr/database'
import { eq } from 'drizzle-orm'
import { deleteAvatarFromR2, uploadAvatarToR2 } from '../../infrastructure/storage/upload-avatar'

interface UploadStudentAvatarParams {
  userId: string
  imageBuffer: Buffer
}

const uploadStudentAvatar = async ({
  userId,
  imageBuffer,
}: UploadStudentAvatarParams): Promise<string> => {
  const avatarUrl = await uploadAvatarToR2({ imageBuffer, userId })

  await db.update(users).set({ avatarUrl, updatedAt: new Date() }).where(eq(users.id, userId))

  return avatarUrl
}

const deleteStudentAvatar = async (userId: string): Promise<void> => {
  await deleteAvatarFromR2(userId)

  await db.update(users).set({ avatarUrl: null, updatedAt: new Date() }).where(eq(users.id, userId))
}

export { deleteStudentAvatar, uploadStudentAvatar }

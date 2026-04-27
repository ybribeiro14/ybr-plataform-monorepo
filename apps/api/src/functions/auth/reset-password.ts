import { db, users } from '@ybr/database'
import type { ResetPasswordInput } from '@ybr/schemas'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { cache } from '../../infrastructure/cache/redis'

const resetPassword = async ({ token, password }: ResetPasswordInput) => {
  const userId = await cache.get(`pwd_reset:${token}`)

  if (!userId) {
    const error = new Error('Invalid or expired reset token')
    ;(error as Error & { code: string }).code = 'INVALID_RESET_TOKEN'
    throw error
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId))

  // Invalidate the reset token and any active sessions
  await Promise.all([cache.del(`pwd_reset:${token}`), cache.del(`refresh:${userId}`)])

  return { message: 'Password updated successfully' }
}

export { resetPassword }

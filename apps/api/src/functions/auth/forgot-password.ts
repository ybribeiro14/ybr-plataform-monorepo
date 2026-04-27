import { randomBytes } from 'node:crypto'
import { db, users } from '@ybr/database'
import type { ForgotPasswordInput } from '@ybr/schemas'
import { eq } from 'drizzle-orm'
import { cache } from '../../infrastructure/cache/redis'
import { sendPasswordResetEmail } from '../../infrastructure/email/auth-emails'

const RESET_TOKEN_TTL_SECONDS = 60 * 60 // 1 hour

const forgotPassword = async ({ email }: ForgotPasswordInput) => {
  const GENERIC_RESPONSE = {
    message: 'If this email exists, a reset link was sent',
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, name: true, email: true },
  })

  // Do not reveal whether email exists — OWASP best practice
  if (!user) return GENERIC_RESPONSE

  // 6-char hex token (e.g. "a1b2c3") — stored as key for direct O(1) lookup
  const token = randomBytes(3).toString('hex')

  await cache.setex(`pwd_reset:${token}`, RESET_TOKEN_TTL_SECONDS, user.id)

  sendPasswordResetEmail(user.email, user.name, token).catch(err => {
    // biome-ignore lint/suspicious/noConsole: non-blocking error logging
    console.error('[Email] Failed to send password reset email:', err)
  })

  return GENERIC_RESPONSE
}

export { forgotPassword }

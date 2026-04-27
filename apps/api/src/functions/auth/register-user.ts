import { db, users } from '@ybr/database'
import type { RegisterInput } from '@ybr/schemas'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { sendWelcomeEmail } from '../../infrastructure/email/auth-emails'

const registerUser = async ({ name, email, password }: RegisterInput) => {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  })

  if (existing) {
    const error = new Error('Email already in use')
    ;(error as Error & { code: string }).code = 'EMAIL_ALREADY_EXISTS'
    throw error
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: 'student' })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })

  // Non-blocking — do not fail registration if email fails
  sendWelcomeEmail(email, name).catch(err => {
    // biome-ignore lint/suspicious/noConsole: non-blocking error logging
    console.error('[Email] Failed to send welcome email:', err)
  })

  return user
}

export { registerUser }

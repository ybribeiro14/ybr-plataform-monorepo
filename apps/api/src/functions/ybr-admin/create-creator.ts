import { creators, db, users } from '@ybr/database'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'

interface CreateCreatorParams {
  name: string
  email: string
  plan: 'starter' | 'growth' | 'pro' | 'agency'
}

interface CreatedCreatorResult {
  id: string
  userId: string
  name: string
  email: string
  plan: string
  createdAt: Date
}

const createCreator = async ({
  name,
  email,
  plan,
}: CreateCreatorParams): Promise<CreatedCreatorResult> => {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) {
    const error = new Error('Email already in use') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 409
    error.code = 'EMAIL_ALREADY_EXISTS'
    throw error
  }

  // Generate a temporary password — creator will be asked to reset on first login
  const tempPassword = Math.random().toString(36).slice(-12)
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: 'creator' })
    .returning({ id: users.id, createdAt: users.createdAt })

  if (!user) throw new Error('Failed to create user')

  const [creator] = await db
    .insert(creators)
    .values({ userId: user.id, plan })
    .returning({ id: creators.id })

  if (!creator) throw new Error('Failed to create creator profile')

  return {
    id: creator.id,
    userId: user.id,
    name,
    email,
    plan,
    createdAt: user.createdAt,
  }
}

export type { CreateCreatorParams, CreatedCreatorResult }
export { createCreator }

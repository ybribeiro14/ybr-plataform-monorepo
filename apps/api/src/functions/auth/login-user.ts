import { randomBytes } from 'node:crypto'
import { db, users } from '@ybr/database'
import type { LoginInput } from '@ybr/schemas'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { cache } from '../../infrastructure/cache/redis'

const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

const loginUser = async ({ email, password }: LoginInput, app: FastifyInstance) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  })

  // Generic 401 — do not reveal whether email exists
  if (!user?.passwordHash) {
    const error = new Error('Invalid credentials')
    ;(error as Error & { statusCode: number }).statusCode = 401
    throw error
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    const error = new Error('Invalid credentials')
    ;(error as Error & { statusCode: number }).statusCode = 401
    throw error
  }

  const accessToken = await app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: '15m' })

  // Refresh token: "${userId}:${randomBytes}" — userId is embedded for lookup
  const rawToken = randomBytes(32).toString('hex')
  const refreshToken = `${user.id}:${rawToken}`
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

  await cache.setex(`refresh:${user.id}`, REFRESH_TOKEN_TTL_SECONDS, refreshTokenHash)

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }
}

export { loginUser }

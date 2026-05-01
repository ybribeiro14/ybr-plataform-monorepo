import { randomBytes } from 'node:crypto'
import { db, users } from '@ybr/database'
import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { cache } from '../../infrastructure/cache/redis'
import { uploadAvatarToR2 } from '../../infrastructure/storage/upload-avatar'

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
    avatarUrl: string | null | undefined
  }
}

const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

// Downloads Google profile picture, converts to WebP and uploads to R2.
// Runs fire-and-forget so it never blocks the login response.
const syncGoogleAvatarToR2 = (userId: string, pictureUrl: string): void => {
  void (async () => {
    try {
      const response = await fetch(pictureUrl)
      if (!response.ok) return
      const arrayBuffer = await response.arrayBuffer()
      const imageBuffer = Buffer.from(arrayBuffer)
      const r2Url = await uploadAvatarToR2({ imageBuffer, userId })
      await db
        .update(users)
        .set({ avatarUrl: r2Url, updatedAt: new Date() })
        .where(eq(users.id, userId))
    } catch {
      // Non-critical — silently ignore failures
    }
  })()
}

const buildTokens = async (
  userId: string,
  role: string,
  app: FastifyInstance
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = await app.jwt.sign({ sub: userId, role }, { expiresIn: '15m' })
  const rawToken = randomBytes(32).toString('hex')
  const refreshToken = `${userId}:${rawToken}`
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
  await cache.setex(`refresh:${userId}`, REFRESH_TOKEN_TTL_SECONDS, refreshTokenHash)
  return { accessToken, refreshToken }
}

const loginOrRegisterWithGoogle = async (
  googleUser: GoogleUserInfo,
  app: FastifyInstance
): Promise<AuthTokens> => {
  // Look up by google_id first, then fall back to email
  const existing = await db.query.users.findFirst({
    where: or(eq(users.googleId, googleUser.id), eq(users.email, googleUser.email)),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      googleId: true,
    },
  })

  if (existing) {
    // If found by email but googleId not linked yet, link it now
    if (!existing.googleId) {
      await db
        .update(users)
        .set({ googleId: googleUser.id, updatedAt: new Date() })
        .where(eq(users.id, existing.id))
    }

    // Sync Google photo to R2 in background if not already stored in R2
    if (googleUser.picture && !existing.avatarUrl?.includes('r2.')) {
      syncGoogleAvatarToR2(existing.id, googleUser.picture)
    }

    const { accessToken, refreshToken } = await buildTokens(existing.id, existing.role, app)
    return {
      accessToken,
      refreshToken,
      user: {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        role: existing.role,
        avatarUrl: existing.avatarUrl,
      },
    }
  }

  // New user — create student account
  const [created] = await db
    .insert(users)
    .values({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.id,
      avatarUrl: googleUser.picture ?? null,
      role: 'student',
      // passwordHash is null — Google-only account
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatarUrl: users.avatarUrl,
    })

  if (!created) {
    const error = new Error('Failed to create user account') as Error & {
      statusCode: number
      code: string
    }
    error.statusCode = 500
    error.code = 'USER_CREATION_FAILED'
    throw error
  }

  // Sync Google photo to R2 in background for new users
  if (googleUser.picture) {
    syncGoogleAvatarToR2(created.id, googleUser.picture)
  }

  const { accessToken, refreshToken } = await buildTokens(created.id, created.role, app)
  return {
    accessToken,
    refreshToken,
    user: {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      avatarUrl: created.avatarUrl,
    },
  }
}

export type { AuthTokens, GoogleUserInfo }
export { loginOrRegisterWithGoogle }

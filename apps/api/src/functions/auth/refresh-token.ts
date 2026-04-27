import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'
import { cache } from '../../infrastructure/cache/redis'

const refreshAccessToken = async (
  { refreshToken }: { refreshToken: string },
  app: FastifyInstance
) => {
  // Token format: "${userId}:${randomBytes}"
  const separatorIndex = refreshToken.indexOf(':')
  if (separatorIndex === -1) {
    const error = new Error('Invalid refresh token')
    ;(error as Error & { statusCode: number }).statusCode = 401
    throw error
  }

  const userId = refreshToken.slice(0, separatorIndex)
  const storedHash = await cache.get(`refresh:${userId}`)

  if (!storedHash) {
    const error = new Error('Refresh token expired or revoked')
    ;(error as Error & { statusCode: number }).statusCode = 401
    throw error
  }

  const tokenMatch = await bcrypt.compare(refreshToken, storedHash)
  if (!tokenMatch) {
    const error = new Error('Invalid refresh token')
    ;(error as Error & { statusCode: number }).statusCode = 401
    throw error
  }

  const accessToken = await app.jwt.sign({ sub: userId }, { expiresIn: '15m' })

  return { accessToken }
}

export { refreshAccessToken }

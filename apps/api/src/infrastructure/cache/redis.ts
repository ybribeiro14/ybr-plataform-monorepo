import Redis from 'ioredis'

const createCache = () => {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) throw new Error('REDIS_URL environment variable is required')
  return new Redis(redisUrl)
}

export const cache = createCache()

import { cache } from '../../infrastructure/cache/redis'

const logoutUser = async ({ userId }: { userId: string }) => {
  await cache.del(`refresh:${userId}`)
  return { success: true }
}

export { logoutUser }

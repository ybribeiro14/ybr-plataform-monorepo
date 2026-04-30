import crypto from 'node:crypto'

interface BunnyVideoUploadCredentials {
  videoId: string
  uploadUrl: string
  authSignature: string
  authExpire: number
  libraryId: string
}

const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY ?? ''
const BUNNY_LIBRARY_ID = process.env.BUNNY_VIDEO_LIBRARY_ID ?? ''

const createBunnyVideo = async (title: string): Promise<BunnyVideoUploadCredentials> => {
  const response = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
    method: 'POST',
    headers: {
      AccessKey: BUNNY_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    const error = new Error('Failed to create Bunny video')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 502
    ;(error as Error & { statusCode: number; code: string }).code = 'BUNNY_API_ERROR'
    throw error
  }

  const data = (await response.json()) as { guid: string }
  const videoId = data.guid

  // Signature: sha256(libraryId + apiKey + expirationTime + videoId)
  const authExpire = Math.floor(Date.now() / 1000) + 3600
  const rawSignature = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${authExpire}${videoId}`
  const authSignature = crypto.createHash('sha256').update(rawSignature).digest('hex')

  return {
    videoId,
    uploadUrl: 'https://video.bunnycdn.com/tusupload',
    authSignature,
    authExpire,
    libraryId: BUNNY_LIBRARY_ID,
  }
}

const deleteBunnyVideo = async (videoId: string, libraryId: string): Promise<void> => {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
    {
      method: 'DELETE',
      headers: {
        AccessKey: BUNNY_API_KEY,
      },
    }
  )

  if (!response.ok) {
    const error = new Error('Failed to delete Bunny video')
    ;(error as Error & { statusCode: number; code: string }).statusCode = 502
    ;(error as Error & { statusCode: number; code: string }).code = 'BUNNY_API_ERROR'
    throw error
  }
}

export type { BunnyVideoUploadCredentials }
export { createBunnyVideo, deleteBunnyVideo }

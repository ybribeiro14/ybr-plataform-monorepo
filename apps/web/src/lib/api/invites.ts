import type { ApiResponse } from '@ybr/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'

const handleResponse = async <T>(response: Response): Promise<T> => {
  const body: ApiResponse<T> = await response.json()
  if (!response.ok || body.status === 'error') {
    throw new Error(body.message ?? 'Request failed')
  }
  return body.data as T
}

export interface InviteTokenInfo {
  token: string
  courseId: string
  courseTitle: string
  creatorName: string
  expiresAt: string | null
}

export interface RegisterViaInviteResult {
  userId: string
  enrollmentId: string
  courseTitle: string
  status: 'pending'
}

const getInviteInfo = async (token: string): Promise<InviteTokenInfo> => {
  const res = await fetch(`${BASE_URL}/invite/${token}`)
  return handleResponse<InviteTokenInfo>(res)
}

const registerViaInvite = async (
  token: string,
  data: { name: string; email: string; password: string }
): Promise<RegisterViaInviteResult> => {
  const res = await fetch(`${BASE_URL}/invite/${token}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<RegisterViaInviteResult>(res)
}

export { getInviteInfo, registerViaInvite }

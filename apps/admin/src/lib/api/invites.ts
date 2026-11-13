import type { ApiResponse } from "@ybr/types";
import { getAccessToken } from "../utils/token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface InviteLink {
  id: string
  courseId: string
  token: string
  code: string
  url: string
  label?: string
  usageCount: number
  maxUses?: number
  expiresAt?: string
  isActive: boolean
  createdAt: string
}

interface PendingEnrollment {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  courseId: string
  courseTitle: string
  status: 'pending' | 'active' | 'revoked'
  enrolledAt: string
}

const authHeaders = (): Record<string, string> => {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const handleResponse = async <T>(res: Response): Promise<T> => {
  const body: ApiResponse<T> = await res.json()
  if (!res.ok || body.status === 'error') {
    throw new Error(body.message ?? 'Ocorreu um erro inesperado')
  }
  return body.data as T
}

const listInviteLinks = async (courseId: string): Promise<InviteLink[]> => {
  const res = await fetch(`${BASE_URL}/admin/courses/${courseId}/invites`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  return handleResponse<InviteLink[]>(res)
}

const createInviteLink = async (
  courseId: string,
  data?: string | { label?: string; maxUses?: number; expiresAt?: string },
): Promise<InviteLink> => {
  const body = typeof data === 'string' ? { expiresAt: data } : (data ?? {})
  const res = await fetch(`${BASE_URL}/admin/courses/${courseId}/invites`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse<InviteLink>(res)
}

const revokeInviteLink = async (
  tokenOrCourseId: string,
  inviteId?: string,
): Promise<void> => {
  const url = inviteId
    ? `${BASE_URL}/admin/courses/${tokenOrCourseId}/invites/${inviteId}/revoke`
    : `${BASE_URL}/admin/invite-links/${tokenOrCourseId}`
  const res = await fetch(url, { method: inviteId ? 'PATCH' : 'DELETE', headers: authHeaders() })
  await handleResponse<unknown>(res)
}

const listPendingEnrollments = async (): Promise<PendingEnrollment[]> => {
  const res = await fetch(`${BASE_URL}/admin/enrollments/pending`, {
    headers: authHeaders(),
    cache: 'no-store',
  })
  return handleResponse<PendingEnrollment[]>(res)
}

const activateEnrollment = async (enrollmentId: string): Promise<void> => {
  const res = await fetch(
    `${BASE_URL}/admin/enrollments/${enrollmentId}/activate`,
    { method: 'PATCH', headers: authHeaders() },
  )
  await handleResponse<unknown>(res)
}

const revokeEnrollment = async (enrollmentId: string): Promise<void> => {
  const res = await fetch(
    `${BASE_URL}/admin/enrollments/${enrollmentId}/revoke`,
    { method: 'PATCH', headers: authHeaders() },
  )
  await handleResponse<unknown>(res)
}

export {
  listInviteLinks,
  createInviteLink,
  revokeInviteLink,
  listPendingEnrollments,
  activateEnrollment,
  revokeEnrollment,
}
export type { InviteLink, PendingEnrollment }

import type { ApiResponse } from "@ybr/types";
import { getAccessToken } from "../utils/token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

const authHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const body: ApiResponse<T> = await response.json();
  if (!response.ok || body.status === "error") {
    throw new Error(body.message ?? "Request failed");
  }
  return body.data as T;
};

export interface InviteLink {
  id: string;
  token: string;
  courseId: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PendingEnrollment {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  status: string;
  enrolledAt: string;
}

const createInviteLink = async (
  courseId: string,
  expiresAt?: string,
): Promise<InviteLink> => {
  const res = await fetch(
    `${BASE_URL}/admin/courses/${courseId}/invite-links`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(expiresAt ? { expiresAt } : {}),
    },
  );
  return handleResponse<InviteLink>(res);
};

const listInviteLinks = async (courseId: string): Promise<InviteLink[]> => {
  const res = await fetch(
    `${BASE_URL}/admin/courses/${courseId}/invite-links`,
    {
      headers: authHeaders(),
    },
  );
  return handleResponse<InviteLink[]>(res);
};

const revokeInviteLink = async (token: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/admin/invite-links/${token}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse<{ message: string }>(res);
};

const listPendingEnrollments = async (): Promise<PendingEnrollment[]> => {
  const res = await fetch(`${BASE_URL}/admin/enrollments/pending`, {
    headers: authHeaders(),
  });
  return handleResponse<PendingEnrollment[]>(res);
};

const activateEnrollment = async (enrollmentId: string): Promise<void> => {
  const res = await fetch(
    `${BASE_URL}/admin/enrollments/${enrollmentId}/activate`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );
  await handleResponse<unknown>(res);
};

const revokeEnrollment = async (enrollmentId: string): Promise<void> => {
  const res = await fetch(
    `${BASE_URL}/admin/enrollments/${enrollmentId}/revoke`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );
  await handleResponse<unknown>(res);
};

export {
  activateEnrollment,
  createInviteLink,
  listInviteLinks,
  listPendingEnrollments,
  revokeEnrollment,
  revokeInviteLink,
};

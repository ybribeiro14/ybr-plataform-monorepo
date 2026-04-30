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

export interface Creator {
  id: string;
  userId: string;
  name: string;
  email: string;
  plan: string;
  isActive: boolean;
  activeCourses: number;
  activeStudents: number;
  createdAt: string;
}

export interface CreateCreatorInput {
  name: string;
  email: string;
  plan: "starter" | "growth" | "pro" | "agency";
}

const listCreators = async (): Promise<Creator[]> => {
  const res = await fetch(`${BASE_URL}/ybr-admin/creators`, {
    headers: authHeaders(),
  });
  return handleResponse<Creator[]>(res);
};

const createCreator = async (input: CreateCreatorInput): Promise<Creator> => {
  const res = await fetch(`${BASE_URL}/ybr-admin/creators`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<Creator>(res);
};

const toggleCreatorStatus = async (
  creatorId: string,
  isActive: boolean,
): Promise<{ id: string; isActive: boolean }> => {
  const res = await fetch(
    `${BASE_URL}/ybr-admin/creators/${creatorId}/status`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ isActive }),
    },
  );
  return handleResponse<{ id: string; isActive: boolean }>(res);
};

export { createCreator, listCreators, toggleCreatorStatus };

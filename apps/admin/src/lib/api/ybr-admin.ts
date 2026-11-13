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

interface Creator {
  id: string;
  userId: string;
  name: string;
  email: string;
  plan: string;
  isActive: boolean;
  activeCourses: number;
  activeStudents: number;
  createdAt: string;
  coursesLimit?: number | null;
}

interface CreateCreatorInput {
  name: string;
  email: string;
  plan: "starter" | "growth" | "pro" | "agency";
}

interface CreatorStorageStats {
  creatorId: string;
  documents: {
    totalFiles: number;
    totalBytes: number;
  };
  videos: {
    totalVideos: number;
    totalDurationSeconds: number;
  };
}

interface PlatformStats {
  totalCreators: number;
  activeCreators: number;
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalEnrollments: number;
}

interface UpdateCreatorInput {
  plan?: "starter" | "growth" | "pro" | "agency";
  isActive?: boolean;
  coursesLimit?: number | null;
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

const getPlatformStats = async (): Promise<PlatformStats> => {
  const res = await fetch(`${BASE_URL}/ybr-admin/stats`, {
    headers: authHeaders(),
  });
  return handleResponse<PlatformStats>(res);
};

const getCreatorStorage = async (
  creatorId: string,
): Promise<CreatorStorageStats> => {
  const res = await fetch(
    `${BASE_URL}/ybr-admin/creators/${creatorId}/storage`,
    {
      headers: authHeaders(),
    },
  );
  return handleResponse<CreatorStorageStats>(res);
};

const updateCreator = async (
  creatorId: string,
  input: UpdateCreatorInput,
): Promise<Creator & { coursesLimit: number | null }> => {
  const res = await fetch(`${BASE_URL}/ybr-admin/creators/${creatorId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<Creator & { coursesLimit: number | null }>(res);
};

export {
  createCreator,
  getCreatorStorage,
  getPlatformStats,
  listCreators,
  toggleCreatorStatus,
  updateCreator,
};
export type {
  Creator,
  CreateCreatorInput,
  CreatorStorageStats,
  PlatformStats,
  UpdateCreatorInput,
};

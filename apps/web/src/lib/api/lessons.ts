import type { ApiResponse } from "@ybr/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface LessonStreamData {
  lessonId: string;
  title: string;
  streamUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  progress: {
    watchedSeconds: number;
    completed: boolean;
  } | null;
}

interface ProgressUpdateResult {
  watchedSeconds: number;
  completed: boolean;
  completedAt: string | null;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const body: ApiResponse<T> = await response.json();
  if (!response.ok || body.status === "error") {
    const error = new Error(body.message ?? "An unexpected error occurred");
    Object.assign(error, { statusCode: response.status, errors: body.errors });
    throw error;
  }
  return body.data as T;
};

const getLessonStream = async ({
  lessonId,
  token,
}: {
  lessonId: string;
  token: string;
}): Promise<LessonStreamData> => {
  const response = await fetch(
    `${BASE_URL}/student/lessons/${lessonId}/stream`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  return handleResponse<LessonStreamData>(response);
};

const updateLessonProgress = async ({
  lessonId,
  watchedSeconds,
  token,
}: {
  lessonId: string;
  watchedSeconds: number;
  token: string;
}): Promise<ProgressUpdateResult> => {
  const response = await fetch(
    `${BASE_URL}/student/lessons/${lessonId}/progress`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ watchedSeconds }),
    },
  );
  return handleResponse<ProgressUpdateResult>(response);
};

export { getLessonStream, updateLessonProgress };
export type { LessonStreamData, ProgressUpdateResult };

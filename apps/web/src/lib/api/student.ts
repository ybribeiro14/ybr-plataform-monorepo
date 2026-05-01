import type {
  ApiResponse,
  StudentProfile,
  UpdateProfileInput,
} from "@ybr/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface LessonProgress {
  watchedSeconds: number;
  completed: boolean;
}

interface StudentLesson {
  lessonId: string;
  title: string;
  position: number;
  durationSeconds: number | null;
  hasVideo: boolean;
  progress: LessonProgress | null;
}

interface StudentModule {
  moduleId: string;
  title: string;
  position: number;
  lessons: StudentLesson[];
}

interface StudentCourseDetails {
  courseId: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  modules: StudentModule[];
}

interface EnrollmentWithProgress {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  enrolledAt: string;
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

const getEnrollments = async (
  token: string,
): Promise<EnrollmentWithProgress[]> => {
  const response = await fetch(`${BASE_URL}/student/enrollments`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<EnrollmentWithProgress[]>(response);
};

const getCourseDetails = async (
  courseId: string,
  token: string,
): Promise<StudentCourseDetails> => {
  const response = await fetch(`${BASE_URL}/student/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<StudentCourseDetails>(response);
};

export { getCourseDetails, getEnrollments };
export type {
  EnrollmentWithProgress,
  LessonProgress,
  StudentCourseDetails,
  StudentLesson,
  StudentModule,
};

// ─── Profile ─────────────────────────────────────────────────

const getProfile = async (token: string): Promise<StudentProfile> => {
  const response = await fetch(`${BASE_URL}/student/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<StudentProfile>(response);
};

const updateProfile = async (
  token: string,
  body: UpdateProfileInput,
): Promise<StudentProfile> => {
  const response = await fetch(`${BASE_URL}/student/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<StudentProfile>(response);
};

const uploadAvatar = async (token: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${BASE_URL}/student/profile/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await handleResponse<{ avatarUrl: string }>(response);
  return data.avatarUrl;
};

const deleteAvatar = async (token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/student/profile/avatar`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse<{ message: string }>(response);
};

export { deleteAvatar, getProfile, updateProfile, uploadAvatar };
export type { StudentProfile, UpdateProfileInput };

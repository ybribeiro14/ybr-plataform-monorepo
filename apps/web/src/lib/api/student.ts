import type { ApiResponse } from "@ybr/types";

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

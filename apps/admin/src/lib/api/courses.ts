import type {
  CreateCourseInput,
  CreateLessonInput,
  CreateModuleInput,
  UpdateCourseInput,
  UpdateLessonInput,
  UpdateModuleInput,
} from "@ybr/schemas";
import type { ApiResponse } from "@ybr/types";
import type {
  Course,
  CourseWithCounts,
  CourseWithModules,
  Lesson,
  Module,
} from "../types/courses";
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
    throw new Error(body.message ?? "Ocorreu um erro inesperado");
  }
  return body.data as T;
};

const listCourses = async (): Promise<CourseWithCounts[]> => {
  const response = await fetch(`${BASE_URL}/admin/courses`, {
    headers: authHeaders(),
  });
  return handleResponse<CourseWithCounts[]>(response);
};

const getCourse = async (courseId: string): Promise<CourseWithModules> => {
  const response = await fetch(`${BASE_URL}/admin/courses/${courseId}`, {
    headers: authHeaders(),
  });
  return handleResponse<CourseWithModules>(response);
};

const createCourse = async (data: CreateCourseInput): Promise<Course> => {
  const response = await fetch(`${BASE_URL}/admin/courses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Course>(response);
};

const updateCourse = async (
  courseId: string,
  data: UpdateCourseInput,
): Promise<Course> => {
  const response = await fetch(`${BASE_URL}/admin/courses/${courseId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Course>(response);
};

const deleteCourse = async (courseId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/admin/courses/${courseId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse<{ message: string }>(response);
};

const publishCourse = async (courseId: string): Promise<Course> => {
  const response = await fetch(
    `${BASE_URL}/admin/courses/${courseId}/publish`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );
  return handleResponse<Course>(response);
};

const uploadThumbnail = async (
  courseId: string,
  file: File,
): Promise<{ thumbnailUrl: string }> => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(
    `${BASE_URL}/admin/courses/${courseId}/thumbnail`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );
  return handleResponse<{ thumbnailUrl: string }>(response);
};

const createModule = async (
  courseId: string,
  data: CreateModuleInput,
): Promise<Module> => {
  const response = await fetch(
    `${BASE_URL}/admin/courses/${courseId}/modules`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    },
  );
  return handleResponse<Module>(response);
};

const updateModule = async (
  moduleId: string,
  data: UpdateModuleInput,
): Promise<Module> => {
  const response = await fetch(`${BASE_URL}/admin/modules/${moduleId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Module>(response);
};

const deleteModule = async (moduleId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/admin/modules/${moduleId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse<{ message: string }>(response);
};

const reorderModules = async (
  modules: Array<{ id: string; position: number }>,
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/admin/modules/reorder`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ modules }),
  });
  await handleResponse<Array<{ id: string; position: number }>>(response);
};

const createLesson = async (
  moduleId: string,
  data: CreateLessonInput,
): Promise<Lesson> => {
  const response = await fetch(
    `${BASE_URL}/admin/modules/${moduleId}/lessons`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    },
  );
  return handleResponse<Lesson>(response);
};

const updateLesson = async (
  lessonId: string,
  data: UpdateLessonInput,
): Promise<Lesson> => {
  const response = await fetch(`${BASE_URL}/admin/lessons/${lessonId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Lesson>(response);
};

const deleteLesson = async (lessonId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/admin/lessons/${lessonId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse<{ message: string }>(response);
};

export const coursesApi = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  uploadThumbnail,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  createLesson,
  updateLesson,
  deleteLesson,
};

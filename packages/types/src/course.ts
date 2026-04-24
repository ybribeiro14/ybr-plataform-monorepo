export type CourseStatus = "draft" | "published" | "archived";
export type CourseLanguage = "pt-BR" | "en-US";
export type CourseCurrency = "USD" | "BRL";

export interface Course {
  id: string;
  creatorId: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  priceCents: number;
  currency: CourseCurrency;
  status: CourseStatus;
  language: CourseLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  position: number;
  isPublished: boolean;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  bunnyVideoId: string | null;
  muxPlaybackId: string | null;
  durationSeconds: number | null;
  position: number;
  isFreePreview: boolean;
  isPublished: boolean;
}

export interface LessonAttachment {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileType: "pdf" | "doc" | "spreadsheet" | "link";
  fileSizeBytes: number | null;
}

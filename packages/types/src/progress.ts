export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  watchedSeconds: number;
  completedAt: string | null;
  lastWatchedAt: string;
}

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentageComplete: number;
  nextLesson: {
    id: string;
    title: string;
    moduleTitle: string;
  } | null;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
  certificateUrl: string | null;
  verificationCode: string;
  issuedAt: string;
}

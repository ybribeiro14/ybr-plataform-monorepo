import {
  courseModules,
  courses,
  db,
  enrollments,
  lessonProgress,
  lessons,
} from "@ybr/database";
import { and, eq } from "drizzle-orm";

interface GetStudentCourseParams {
  courseId: string;
  userId: string;
}

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

const throwError = (
  message: string,
  statusCode: number,
  code: string,
): never => {
  const error = new Error(message) as Error & {
    statusCode: number;
    code: string;
  };
  error.statusCode = statusCode;
  error.code = code;
  throw error;
};

const getStudentCourse = async ({
  courseId,
  userId,
}: GetStudentCourseParams): Promise<StudentCourseDetails> => {
  const [enrollment] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);

  if (!enrollment) {
    throwError("Not enrolled in this course", 403, "NOT_ENROLLED");
  }

  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      thumbnailUrl: courses.thumbnailUrl,
    })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course) {
    return throwError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  const rows = await db
    .select({
      moduleId: courseModules.id,
      moduleTitle: courseModules.title,
      modulePosition: courseModules.position,
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      lessonPosition: lessons.position,
      durationSeconds: lessons.durationSeconds,
      bunnyVideoId: lessons.bunnyVideoId,
      muxPlaybackId: lessons.muxPlaybackId,
      watchedSeconds: lessonProgress.watchedSeconds,
      completedAt: lessonProgress.completedAt,
    })
    .from(courseModules)
    .innerJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.lessonId, lessons.id),
        eq(lessonProgress.userId, userId),
      ),
    )
    .where(eq(courseModules.courseId, courseId))
    .orderBy(courseModules.position, lessons.position);

  const modulesMap = new Map<string, StudentModule>();

  for (const row of rows) {
    if (!modulesMap.has(row.moduleId)) {
      modulesMap.set(row.moduleId, {
        moduleId: row.moduleId,
        title: row.moduleTitle,
        position: row.modulePosition,
        lessons: [],
      });
    }

    const mod = modulesMap.get(row.moduleId);
    if (!mod) continue;
    mod.lessons.push({
      lessonId: row.lessonId,
      title: row.lessonTitle,
      position: row.lessonPosition,
      durationSeconds: row.durationSeconds,
      hasVideo: Boolean(row.bunnyVideoId ?? row.muxPlaybackId),
      progress:
        row.watchedSeconds !== null
          ? {
              watchedSeconds: row.watchedSeconds,
              completed: row.completedAt !== null,
            }
          : null,
    });
  }

  const modules = Array.from(modulesMap.values());
  const totalLessons = rows.length;
  const completedLessons = rows.filter((r) => r.completedAt !== null).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    courseId: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    totalLessons,
    completedLessons,
    progressPercent,
    modules,
  };
};

export { getStudentCourse };
export type { GetStudentCourseParams, StudentCourseDetails };

import {
  courseModules,
  courses,
  db,
  lessonAttachments,
  lessons,
} from "@ybr/database";
import { eq, inArray } from "drizzle-orm";

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

const getCreatorStorage = async (
  creatorId: string,
): Promise<CreatorStorageStats> => {
  const creatorCourses = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.creatorId, creatorId));

  if (creatorCourses.length === 0) {
    return {
      creatorId,
      documents: { totalFiles: 0, totalBytes: 0 },
      videos: { totalVideos: 0, totalDurationSeconds: 0 },
    };
  }

  const courseIds = creatorCourses.map((c) => c.id);

  const creatorModules = await db
    .select({ id: courseModules.id })
    .from(courseModules)
    .where(inArray(courseModules.courseId, courseIds));

  if (creatorModules.length === 0) {
    return {
      creatorId,
      documents: { totalFiles: 0, totalBytes: 0 },
      videos: { totalVideos: 0, totalDurationSeconds: 0 },
    };
  }

  const moduleIds = creatorModules.map((m) => m.id);

  const creatorLessons = await db
    .select({
      id: lessons.id,
      bunnyVideoId: lessons.bunnyVideoId,
      muxAssetId: lessons.muxAssetId,
      durationSeconds: lessons.durationSeconds,
    })
    .from(lessons)
    .where(inArray(lessons.moduleId, moduleIds));

  const lessonIds = creatorLessons.map((l) => l.id);

  const totalVideos = creatorLessons.filter(
    (l) => l.bunnyVideoId !== null || l.muxAssetId !== null,
  ).length;

  const totalDurationSeconds = creatorLessons.reduce(
    (acc, l) => acc + (l.durationSeconds ?? 0),
    0,
  );

  let totalFiles = 0;
  let totalBytes = 0;

  if (lessonIds.length > 0) {
    const attachmentData = await db
      .select({
        id: lessonAttachments.id,
        fileSizeBytes: lessonAttachments.fileSizeBytes,
      })
      .from(lessonAttachments)
      .where(inArray(lessonAttachments.lessonId, lessonIds));

    totalFiles = attachmentData.length;
    totalBytes = attachmentData.reduce(
      (acc, a) => acc + (a.fileSizeBytes ?? 0),
      0,
    );
  }

  return {
    creatorId,
    documents: { totalFiles, totalBytes },
    videos: { totalVideos, totalDurationSeconds },
  };
};

export { getCreatorStorage };
export type { CreatorStorageStats };

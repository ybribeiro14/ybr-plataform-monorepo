import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  courseModules,
  courses,
  db,
  lessonAttachments,
  lessons,
} from "@ybr/database";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "../../infrastructure/storage/r2";

interface CreateAttachmentInput {
  lessonId: string;
  creatorId: string;
  title: string;
  fileBuffer: Buffer;
  mimeType: string;
  originalFileName: string;
  fileSizeBytes: number;
}

interface CreatedAttachment {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileType: "pdf" | "doc" | "spreadsheet" | "link";
  fileSizeBytes: number;
  createdAt: Date;
}

const inferFileType = (
  mimeType: string,
  fileName: string,
): "pdf" | "doc" | "spreadsheet" | "link" => {
  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) return "pdf";
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".csv")
  )
    return "spreadsheet";
  return "doc";
};

const createAttachment = async ({
  lessonId,
  creatorId,
  title,
  fileBuffer,
  mimeType,
  originalFileName,
  fileSizeBytes,
}: CreateAttachmentInput): Promise<CreatedAttachment> => {
  const [lesson] = await db
    .select({ id: lessons.id, moduleId: lessons.moduleId })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) {
    const error = new Error("Lesson not found") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 404;
    error.code = "LESSON_NOT_FOUND";
    throw error;
  }

  const [mod] = await db
    .select({ courseId: courseModules.courseId })
    .from(courseModules)
    .where(eq(courseModules.id, lesson.moduleId))
    .limit(1);

  const [course] = await db
    .select({ creatorId: courses.creatorId })
    .from(courses)
    .where(eq(courses.id, mod?.courseId ?? ""))
    .limit(1);

  if (!course || course.creatorId !== creatorId) {
    const error = new Error("Forbidden") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  if (!r2) {
    const error = new Error("Storage not configured") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 503;
    error.code = "STORAGE_UNAVAILABLE";
    throw error;
  }

  const ext = originalFileName.split(".").pop() ?? "bin";
  const key = `attachments/${creatorId}/${lessonId}/${randomUUID()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ContentLength: fileSizeBytes,
    }),
  );

  const fileUrl = `${R2_PUBLIC_URL}/${key}`;
  const fileType = inferFileType(mimeType, originalFileName);

  const [attachment] = await db
    .insert(lessonAttachments)
    .values({
      lessonId,
      title,
      fileUrl,
      fileType,
      fileSizeBytes,
    })
    .returning();

  return {
    id: attachment.id,
    lessonId: attachment.lessonId,
    title: attachment.title,
    fileUrl: attachment.fileUrl,
    fileType: attachment.fileType as "pdf" | "doc" | "spreadsheet" | "link",
    fileSizeBytes: attachment.fileSizeBytes ?? fileSizeBytes,
    createdAt: attachment.createdAt,
  };
};

export { createAttachment };
export type { CreateAttachmentInput, CreatedAttachment };

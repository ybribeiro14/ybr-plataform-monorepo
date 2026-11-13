import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  courseModules,
  courses,
  db,
  lessonAttachments,
  lessons,
} from "@ybr/database";
import { eq } from "drizzle-orm";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "../../infrastructure/storage/r2";

interface DeleteAttachmentInput {
  attachmentId: string;
  lessonId: string;
  creatorId: string;
}

const deleteAttachment = async ({
  attachmentId,
  lessonId,
  creatorId,
}: DeleteAttachmentInput): Promise<void> => {
  const [attachment] = await db
    .select()
    .from(lessonAttachments)
    .where(eq(lessonAttachments.id, attachmentId))
    .limit(1);

  if (!attachment || attachment.lessonId !== lessonId) {
    const error = new Error("Attachment not found") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 404;
    error.code = "ATTACHMENT_NOT_FOUND";
    throw error;
  }

  const [lesson] = await db
    .select({ moduleId: lessons.moduleId })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  const [mod] = await db
    .select({ courseId: courseModules.courseId })
    .from(courseModules)
    .where(eq(courseModules.id, lesson?.moduleId ?? ""))
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

  if (r2 && attachment.fileUrl.startsWith(R2_PUBLIC_URL)) {
    const key = attachment.fileUrl.replace(`${R2_PUBLIC_URL}/`, "");
    await r2
      .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
      .catch(() => {
        // Log but don't fail — DB record will still be deleted
      });
  }

  await db
    .delete(lessonAttachments)
    .where(eq(lessonAttachments.id, attachmentId));
};

export { deleteAttachment };
export type { DeleteAttachmentInput };

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { creators, db, users } from "@ybr/database";
import { eq } from "drizzle-orm";
import {
  R2_BUCKET,
  R2_PUBLIC_URL,
  r2,
} from "../../../infrastructure/storage/r2";

interface UploadCreatorAvatarParams {
  userId: string;
  buffer: Buffer;
  mimeType: string;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const uploadCreatorAvatar = async ({
  userId,
  buffer,
  mimeType,
}: UploadCreatorAvatarParams) => {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    const error = new Error("Invalid file type. Allowed: JPEG, PNG, WebP");
    (error as Error & { statusCode: number; code: string }).statusCode = 400;
    (error as Error & { statusCode: number; code: string }).code =
      "INVALID_FILE_TYPE";
    throw error;
  }

  if (buffer.length > MAX_SIZE_BYTES) {
    const error = new Error("File too large. Maximum size is 5 MB");
    (error as Error & { statusCode: number; code: string }).statusCode = 400;
    (error as Error & { statusCode: number; code: string }).code =
      "FILE_TOO_LARGE";
    throw error;
  }

  const [creator] = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.userId, userId))
    .limit(1);

  if (!creator) {
    const error = new Error("Creator not found");
    (error as Error & { statusCode: number; code: string }).statusCode = 404;
    (error as Error & { statusCode: number; code: string }).code =
      "CREATOR_NOT_FOUND";
    throw error;
  }

  if (!r2) {
    const error = new Error("File storage is not configured");
    (error as Error & { statusCode: number; code: string }).statusCode = 503;
    (error as Error & { statusCode: number; code: string }).code =
      "STORAGE_NOT_CONFIGURED";
    throw error;
  }

  const extension =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/webp"
        ? "webp"
        : "jpg";
  const key = `avatars/creators/${creator.id}.${extension}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  const avatarUrl = `${R2_PUBLIC_URL}/${key}`;

  await db
    .update(users)
    .set({ avatarUrl, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { avatarUrl };
};

export { uploadCreatorAvatar };
export type { UploadCreatorAvatarParams };

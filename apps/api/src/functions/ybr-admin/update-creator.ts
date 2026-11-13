import { creators, db, users } from "@ybr/database";
import { eq } from "drizzle-orm";

interface UpdateCreatorInput {
  creatorId: string;
  plan?: "starter" | "growth" | "pro" | "agency";
  isActive?: boolean;
  coursesLimit?: number | null;
}

interface UpdateCreatorResult {
  id: string;
  userId: string;
  name: string;
  email: string;
  plan: string;
  isActive: boolean;
  coursesLimit: number | null;
  updatedAt: Date;
}

const updateCreator = async ({
  creatorId,
  plan,
  isActive,
  coursesLimit,
}: UpdateCreatorInput): Promise<UpdateCreatorResult> => {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (plan !== undefined) updateData.plan = plan;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (coursesLimit !== undefined) updateData.coursesLimit = coursesLimit;

  const [updated] = await db
    .update(creators)
    .set(updateData)
    .where(eq(creators.id, creatorId))
    .returning({
      id: creators.id,
      userId: creators.userId,
      plan: creators.plan,
      isActive: creators.isActive,
      coursesLimit: creators.coursesLimit,
      updatedAt: creators.updatedAt,
    });

  if (!updated) {
    const error = new Error("Creator not found") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 404;
    error.code = "CREATOR_NOT_FOUND";
    throw error;
  }

  const [user] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, updated.userId))
    .limit(1);

  return {
    id: updated.id,
    userId: updated.userId,
    name: user?.name ?? "",
    email: user?.email ?? "",
    plan: updated.plan,
    isActive: updated.isActive,
    coursesLimit: updated.coursesLimit ?? null,
    updatedAt: updated.updatedAt,
  };
};

export { updateCreator };
export type { UpdateCreatorInput, UpdateCreatorResult };

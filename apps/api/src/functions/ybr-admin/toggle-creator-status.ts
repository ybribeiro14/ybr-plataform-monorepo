import { creators, db, users } from "@ybr/database";
import { eq } from "drizzle-orm";

interface ToggleCreatorStatusParams {
  creatorId: string;
  isActive: boolean;
}

interface ToggleCreatorStatusResult {
  id: string;
  userId: string;
  name: string;
  email: string;
  isActive: boolean;
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

const toggleCreatorStatus = async ({
  creatorId,
  isActive,
}: ToggleCreatorStatusParams): Promise<ToggleCreatorStatusResult> => {
  const [existing] = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.id, creatorId))
    .limit(1);

  if (!existing) {
    throwError("Creator not found", 404, "CREATOR_NOT_FOUND");
  }

  const [updated] = await db
    .update(creators)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(creators.id, creatorId))
    .returning({
      id: creators.id,
      userId: creators.userId,
      isActive: creators.isActive,
    });

  if (!updated) {
    throwError("Failed to update creator status", 500, "UPDATE_FAILED");
  }

  const [userRow] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, updated!.userId))
    .limit(1);

  return {
    id: updated!.id,
    userId: updated!.userId,
    name: userRow?.name ?? "",
    email: userRow?.email ?? "",
    isActive: updated!.isActive,
  };
};

export { toggleCreatorStatus };
export type { ToggleCreatorStatusResult };

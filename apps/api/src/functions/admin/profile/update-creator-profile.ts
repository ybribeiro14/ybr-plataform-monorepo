import { creators, db, users } from "@ybr/database";
import { eq } from "drizzle-orm";

interface UpdateCreatorProfileInput {
  userId: string;
  name?: string;
  bio?: string;
  website?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender?: "female" | "male" | "nonbinary" | "prefer_not_to_say";
  country?: string;
  zipCode?: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

const updateCreatorProfile = async ({
  userId,
  name,
  bio,
  website,
  ...creatorFields
}: UpdateCreatorProfileInput) => {
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

  const updates: Promise<unknown>[] = [];

  if (name !== undefined) {
    updates.push(
      db
        .update(users)
        .set({ name, updatedAt: new Date() })
        .where(eq(users.id, userId)),
    );
  }

  const creatorUpdates = { bio, website, ...creatorFields };
  const hasCreatorUpdates = Object.values(creatorUpdates).some(
    (v) => v !== undefined,
  );

  if (hasCreatorUpdates) {
    const cleanUpdates = Object.fromEntries(
      Object.entries(creatorUpdates).filter(([, v]) => v !== undefined),
    );
    updates.push(
      db
        .update(creators)
        .set({ ...cleanUpdates, updatedAt: new Date() })
        .where(eq(creators.id, creator.id)),
    );
  }

  await Promise.all(updates);

  return { success: true };
};

export { updateCreatorProfile };
export type { UpdateCreatorProfileInput };

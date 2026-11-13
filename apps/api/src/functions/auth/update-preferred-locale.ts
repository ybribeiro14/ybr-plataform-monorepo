import { db, users } from "@ybr/database";
import { eq } from "drizzle-orm";

interface UpdatePreferredLocaleInput {
  userId: string;
  locale: "pt-BR" | "en";
}

const updatePreferredLocale = async ({
  userId,
  locale,
}: UpdatePreferredLocaleInput) => {
  await db
    .update(users)
    .set({ preferredLocale: locale, updatedAt: new Date() })
    .where(eq(users.id, userId));
  return { preferredLocale: locale };
};

export { updatePreferredLocale };
export type { UpdatePreferredLocaleInput };

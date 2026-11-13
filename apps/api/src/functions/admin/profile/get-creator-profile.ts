import { creators, db, users } from "@ybr/database";
import { eq } from "drizzle-orm";

const getCreatorProfile = async ({ userId }: { userId: string }) => {
  const result = await db
    .select({
      // User fields
      userId: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      preferredLocale: users.preferredLocale,
      // Creator fields
      creatorId: creators.id,
      bio: creators.bio,
      website: creators.website,
      phone: creators.phone,
      cpf: creators.cpf,
      birthDate: creators.birthDate,
      gender: creators.gender,
      country: creators.country,
      zipCode: creators.zipCode,
      street: creators.street,
      streetNumber: creators.streetNumber,
      complement: creators.complement,
      neighborhood: creators.neighborhood,
      city: creators.city,
      state: creators.state,
    })
    .from(users)
    .innerJoin(creators, eq(creators.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length === 0) {
    const error = new Error("Creator profile not found");
    (error as Error & { statusCode: number; code: string }).statusCode = 404;
    (error as Error & { statusCode: number; code: string }).code =
      "PROFILE_NOT_FOUND";
    throw error;
  }

  return result[0];
};

export { getCreatorProfile };

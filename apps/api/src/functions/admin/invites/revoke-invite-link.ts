import { db, inviteTokens } from "@ybr/database";
import { and, eq } from "drizzle-orm";

interface RevokeInviteLinkParams {
  token: string;
  creatorId: string;
}

const revokeInviteLink = async ({
  token,
  creatorId,
}: RevokeInviteLinkParams): Promise<void> => {
  const [existing] = await db
    .select({ id: inviteTokens.id })
    .from(inviteTokens)
    .where(
      and(eq(inviteTokens.token, token), eq(inviteTokens.creatorId, creatorId)),
    )
    .limit(1);

  if (!existing) {
    const error = new Error("Invite link not found") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 404;
    error.code = "INVITE_NOT_FOUND";
    throw error;
  }

  await db
    .update(inviteTokens)
    .set({ isActive: false })
    .where(eq(inviteTokens.id, existing.id));
};

export { revokeInviteLink };
export type { RevokeInviteLinkParams };

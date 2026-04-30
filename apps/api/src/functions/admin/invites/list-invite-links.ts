import { courses, creators, db, inviteTokens } from "@ybr/database";
import { and, eq } from "drizzle-orm";

interface ListInviteLinksParams {
  courseId: string;
  creatorId: string;
}

interface InviteLinkItem {
  id: string;
  token: string;
  courseId: string;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

const listInviteLinks = async ({
  courseId,
  creatorId,
}: ListInviteLinksParams): Promise<InviteLinkItem[]> => {
  // Verify course belongs to creator
  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .innerJoin(creators, eq(courses.creatorId, creators.id))
    .where(and(eq(courses.id, courseId), eq(creators.id, creatorId)))
    .limit(1);

  if (!course) {
    const error = new Error("Course not found") as Error & {
      statusCode: number;
      code: string;
    };
    error.statusCode = 404;
    error.code = "COURSE_NOT_FOUND";
    throw error;
  }

  const links = await db
    .select()
    .from(inviteTokens)
    .where(
      and(
        eq(inviteTokens.courseId, courseId),
        eq(inviteTokens.creatorId, creatorId),
      ),
    );

  return links.map((l) => ({
    id: l.id,
    token: l.token,
    courseId: l.courseId,
    expiresAt: l.expiresAt,
    isActive: l.isActive,
    createdAt: l.createdAt,
  }));
};

export { listInviteLinks };
export type { InviteLinkItem, ListInviteLinksParams };

import { db } from "@ybr/database";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "../../../src/functions/auth/get-current-user";

vi.mock("@ybr/database", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
  users: {},
}));

const mockUser = {
  id: "usr_01j8n4test001",
  email: "alice@example.com",
  name: "Alice Test",
  role: "student" as const,
  avatarUrl: null,
  createdAt: new Date("2024-01-01"),
};

describe("getCurrentUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns user data including id, email, name, role, avatarUrl, and createdAt", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);

    const result = await getCurrentUser({ userId: mockUser.id });

    expect(result.id).toBe(mockUser.id);
    expect(result.email).toBe(mockUser.email);
    expect(result.name).toBe(mockUser.name);
    expect(result.role).toBe(mockUser.role);
    expect(result.avatarUrl).toBeNull();
    expect(result.createdAt).toEqual(mockUser.createdAt);
  });

  it("throws 404 when the user does not exist", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);

    await expect(
      getCurrentUser({ userId: "nonexistent-id" }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

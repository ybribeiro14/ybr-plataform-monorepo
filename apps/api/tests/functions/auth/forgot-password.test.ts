import { db } from "@ybr/database";
import { afterEach, describe, expect, it, vi } from "vitest";
import { forgotPassword } from "../../../src/functions/auth/forgot-password";
import { cache } from "../../../src/infrastructure/cache/redis";
import { sendPasswordResetEmail } from "../../../src/infrastructure/email/auth-emails";

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

vi.mock("../../../src/infrastructure/cache/redis", () => ({
  cache: {
    get: vi.fn(),
    setex: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock("../../../src/infrastructure/email/auth-emails", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const mockUser = {
  id: "usr_01j8n4test001",
  email: "alice@example.com",
  name: "Alice Test",
};

describe("forgotPassword", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a generic response when the email does not exist", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);

    const result = await forgotPassword({ email: "notfound@example.com" });

    expect(result.message).toBe("If this email exists, a reset link was sent");
  });

  it("returns the same generic response even when the email exists", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(cache.setex).mockResolvedValue("OK" as any);

    const result = await forgotPassword({ email: mockUser.email });

    expect(result.message).toBe("If this email exists, a reset link was sent");
  });

  it("generates a 6-character hexadecimal token and stores it in Redis", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(cache.setex).mockResolvedValue("OK" as any);

    await forgotPassword({ email: mockUser.email });

    const [key] = vi.mocked(cache.setex).mock.calls[0] as string[];
    const token = key.replace("pwd_reset:", "");

    expect(token).toMatch(/^[a-f0-9]{6}$/);
  });

  it("saves the reset token in Redis with TTL of 3600 seconds", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(cache.setex).mockResolvedValue("OK" as any);

    await forgotPassword({ email: mockUser.email });

    expect(vi.mocked(cache.setex)).toHaveBeenCalledWith(
      expect.stringMatching(/^pwd_reset:/),
      3600,
      mockUser.id,
    );
  });

  it("calls sendPasswordResetEmail non-blocking after storing the token", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(cache.setex).mockResolvedValue("OK" as any);

    await forgotPassword({ email: mockUser.email });

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      mockUser.email,
      mockUser.name,
      expect.stringMatching(/^[a-f0-9]{6}$/),
    );
  });

  it("does not fail if sendPasswordResetEmail throws", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(cache.setex).mockResolvedValue("OK" as any);
    vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(
      new Error("Email service down"),
    );

    await expect(
      forgotPassword({ email: mockUser.email }),
    ).resolves.toBeDefined();
  });
});

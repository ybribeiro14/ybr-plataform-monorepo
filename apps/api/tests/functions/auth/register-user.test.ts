import { db } from "@ybr/database";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerUser } from "../../../src/functions/auth/register-user";
import { sendWelcomeEmail } from "../../../src/infrastructure/email/auth-emails";

vi.mock("@ybr/database", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
  users: {},
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
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
  role: "student" as const,
  createdAt: new Date("2024-01-01"),
};

const validInput = {
  name: "Alice Test",
  email: "alice@example.com",
  password: "Password1",
};

const setupInsertMock = () => {
  vi.mocked(db.insert).mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([mockUser]),
    }),
  } as any);
};

describe("registerUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user and returns id, email, name, role", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);
    setupInsertMock();

    const result = await registerUser(validInput);

    expect(result.id).toBe(mockUser.id);
    expect(result.email).toBe(mockUser.email);
    expect(result.name).toBe(mockUser.name);
    expect(result.role).toBe(mockUser.role);
  });

  it("does not return passwordHash in the result", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);
    setupInsertMock();

    const result = await registerUser(validInput);

    expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
  });

  it("throws with code EMAIL_ALREADY_EXISTS when email is taken", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      id: "existing-id",
    } as any);

    await expect(registerUser(validInput)).rejects.toMatchObject({
      code: "EMAIL_ALREADY_EXISTS",
    });
  });

  it("calls sendWelcomeEmail after successful registration", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);
    setupInsertMock();

    await registerUser(validInput);

    expect(sendWelcomeEmail).toHaveBeenCalledWith(
      validInput.email,
      validInput.name,
    );
  });

  it("does not fail registration if sendWelcomeEmail throws", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);
    setupInsertMock();
    vi.mocked(sendWelcomeEmail).mockRejectedValueOnce(
      new Error("Email service unavailable"),
    );

    await expect(registerUser(validInput)).resolves.toBeDefined();
  });
});

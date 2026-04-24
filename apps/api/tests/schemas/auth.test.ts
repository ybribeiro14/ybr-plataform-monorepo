import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@ybr/schemas";
import { describe, expect, it } from "vitest";

describe("registerSchema", () => {
  it("accepts valid registration input", () => {
    const result = registerSchema.safeParse({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "Secure123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "jane@example.com",
      password: "Secure123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("name");
  });

  it("rejects an invalid email address", () => {
    const result = registerSchema.safeParse({
      name: "Jane Smith",
      email: "not-an-email",
      password: "Secure123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("email");
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "Sec1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("password");
  });

  it("rejects a password without an uppercase letter", () => {
    const result = registerSchema.safeParse({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "secure123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("password");
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "SecurePassword",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("password");
  });

  it("rejects input with missing required fields", () => {
    const result = registerSchema.safeParse({ email: "jane@example.com" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "anypassword",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("email");
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("password");
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "jane@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-valid" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("email");
  });

  it("rejects a missing email field", () => {
    const result = forgotPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts valid reset input", () => {
    const result = resetPasswordSchema.safeParse({
      token: "valid-reset-token-abc123",
      password: "NewSecure1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "NewSecure1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("token");
  });

  it("rejects a weak password (no uppercase)", () => {
    const result = resetPasswordSchema.safeParse({
      token: "valid-token",
      password: "newsecure1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("password");
  });

  it("rejects a weak password (no number)", () => {
    const result = resetPasswordSchema.safeParse({
      token: "valid-token",
      password: "NewSecurePassword",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("password");
  });
});

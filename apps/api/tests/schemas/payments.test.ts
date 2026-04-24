import { createPaymentIntentSchema, validateCouponSchema } from "@ybr/schemas";
import { describe, expect, it } from "vitest";

describe("createPaymentIntentSchema", () => {
  it("accepts valid input", () => {
    const result = createPaymentIntentSchema.safeParse({
      courseId: "course-uuid-abc123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts input with an optional coupon code", () => {
    const result = createPaymentIntentSchema.safeParse({
      courseId: "course-uuid-abc123",
      couponCode: "SAVE20",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.couponCode).toBe("SAVE20");
    }
  });

  it("rejects an empty courseId", () => {
    const result = createPaymentIntentSchema.safeParse({ courseId: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("courseId");
  });

  it("rejects a missing courseId", () => {
    const result = createPaymentIntentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("validateCouponSchema", () => {
  it("accepts valid coupon validation input", () => {
    const result = validateCouponSchema.safeParse({
      code: "WELCOME10",
      courseId: "course-uuid-abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty coupon code", () => {
    const result = validateCouponSchema.safeParse({
      code: "",
      courseId: "course-uuid-abc123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("code");
  });

  it("rejects an empty courseId", () => {
    const result = validateCouponSchema.safeParse({
      code: "SAVE20",
      courseId: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("courseId");
  });

  it("rejects missing both fields", () => {
    const result = validateCouponSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues.length).toBeGreaterThanOrEqual(2);
  });
});

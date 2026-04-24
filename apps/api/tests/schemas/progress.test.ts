import { updateProgressSchema } from "@ybr/schemas";
import { describe, expect, it } from "vitest";

describe("updateProgressSchema", () => {
  it("accepts valid progress update", () => {
    const result = updateProgressSchema.safeParse({
      lessonId: "lesson-uuid-abc123",
      watchedSeconds: 120,
    });
    expect(result.success).toBe(true);
  });

  it("accepts progress update with completed flag", () => {
    const result = updateProgressSchema.safeParse({
      lessonId: "lesson-uuid-abc123",
      watchedSeconds: 600,
      completed: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(true);
    }
  });

  it("accepts zero watched seconds (lesson just started)", () => {
    const result = updateProgressSchema.safeParse({
      lessonId: "lesson-uuid-abc123",
      watchedSeconds: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty lessonId", () => {
    const result = updateProgressSchema.safeParse({
      lessonId: "",
      watchedSeconds: 120,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("lessonId");
  });

  it("rejects negative watched seconds", () => {
    const result = updateProgressSchema.safeParse({
      lessonId: "lesson-uuid-abc123",
      watchedSeconds: -10,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("watchedSeconds");
  });

  it("rejects a non-integer watchedSeconds value", () => {
    const result = updateProgressSchema.safeParse({
      lessonId: "lesson-uuid-abc123",
      watchedSeconds: 45.7,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("watchedSeconds");
  });

  it("rejects a missing lessonId", () => {
    const result = updateProgressSchema.safeParse({ watchedSeconds: 120 });
    expect(result.success).toBe(false);
  });
});

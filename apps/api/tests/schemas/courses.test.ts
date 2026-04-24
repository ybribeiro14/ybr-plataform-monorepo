import {
  createCourseSchema,
  createLessonSchema,
  createModuleSchema,
  reorderModulesSchema,
  updateCourseSchema,
  updateModuleSchema,
} from "@ybr/schemas";
import { describe, expect, it } from "vitest";

describe("createCourseSchema", () => {
  it("accepts valid course input with defaults", () => {
    const result = createCourseSchema.safeParse({
      title: "Introduction to Baking",
      priceCents: 4999,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("USD");
      expect(result.data.language).toBe("pt-BR");
    }
  });

  it("accepts full valid input", () => {
    const result = createCourseSchema.safeParse({
      title: "Advanced Pastry Techniques",
      description: "Learn professional pastry skills",
      priceCents: 19900,
      currency: "BRL",
      language: "en-US",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than 3 characters", () => {
    const result = createCourseSchema.safeParse({
      title: "AB",
      priceCents: 100,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("title");
  });

  it("rejects a negative price", () => {
    const result = createCourseSchema.safeParse({
      title: "My Course",
      priceCents: -1,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("priceCents");
  });

  it("accepts a price of zero (free course)", () => {
    const result = createCourseSchema.safeParse({
      title: "Free Course",
      priceCents: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unsupported currency", () => {
    const result = createCourseSchema.safeParse({
      title: "My Course",
      priceCents: 1000,
      currency: "EUR",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("currency");
  });

  it("rejects an unsupported language", () => {
    const result = createCourseSchema.safeParse({
      title: "My Course",
      priceCents: 1000,
      language: "fr-FR",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("language");
  });
});

describe("updateCourseSchema", () => {
  it("accepts a partial update (only title)", () => {
    const result = updateCourseSchema.safeParse({ title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (no-op update)", () => {
    const result = updateCourseSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates fields that are provided (rejects invalid title)", () => {
    const result = updateCourseSchema.safeParse({ title: "AB" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("title");
  });
});

describe("createModuleSchema", () => {
  it("accepts a valid module", () => {
    const result = createModuleSchema.safeParse({
      title: "Module 1: Foundations",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a module with optional fields", () => {
    const result = createModuleSchema.safeParse({
      title: "Module 1",
      description: "Learn the basics",
      position: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createModuleSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("title");
  });

  it("rejects a negative position", () => {
    const result = createModuleSchema.safeParse({
      title: "Module 1",
      position: -1,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("position");
  });
});

describe("updateModuleSchema", () => {
  it("accepts a partial update", () => {
    const result = updateModuleSchema.safeParse({
      description: "Updated description",
    });
    expect(result.success).toBe(true);
  });
});

describe("createLessonSchema", () => {
  it("accepts a valid lesson", () => {
    const result = createLessonSchema.safeParse({
      title: "Welcome to the course",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFreePreview).toBe(false);
    }
  });

  it("accepts a free-preview lesson", () => {
    const result = createLessonSchema.safeParse({
      title: "Preview Lesson",
      isFreePreview: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFreePreview).toBe(true);
    }
  });

  it("rejects an empty title", () => {
    const result = createLessonSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("title");
  });
});

describe("reorderModulesSchema", () => {
  it("accepts a valid reorder list", () => {
    const result = reorderModulesSchema.safeParse({
      modules: [
        { id: "mod-1", position: 0 },
        { id: "mod-2", position: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty modules array", () => {
    const result = reorderModulesSchema.safeParse({ modules: [] });
    expect(result.success).toBe(true);
  });

  it("rejects a negative position", () => {
    const result = reorderModulesSchema.safeParse({
      modules: [{ id: "mod-1", position: -1 }],
    });
    expect(result.success).toBe(false);
  });
});

import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(500),
  description: z.string().optional(),
  priceCents: z.number().int().min(0, "Preço deve ser positivo"),
  currency: z.enum(["USD", "BRL"]).default("USD"),
  language: z.enum(["pt-BR", "en-US"]).default("pt-BR"),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(500),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export const updateModuleSchema = createModuleSchema.partial();

export const reorderModulesSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    }),
  ),
});

export const createLessonSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(500),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().default(false),
});

export const updateLessonSchema = createLessonSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

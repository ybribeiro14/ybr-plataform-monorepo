import { z } from "zod";

export const updateProgressSchema = z.object({
  lessonId: z.string().min(1),
  watchedSeconds: z.number().int().min(0),
  completed: z.boolean().optional(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

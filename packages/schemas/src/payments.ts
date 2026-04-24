import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  courseId: z.string().min(1),
  couponCode: z.string().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Código do cupom é obrigatório"),
  courseId: z.string().min(1),
});

export type CreatePaymentIntentInput = z.infer<
  typeof createPaymentIntentSchema
>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

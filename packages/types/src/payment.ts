export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type EnrollmentStatus = "active" | "expired" | "refunded";

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  stripePaymentIntentId: string | null;
  amountCents: number;
  currency: "USD" | "BRL";
  status: PaymentStatus;
  installments: number;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  paymentId: string | null;
  status: EnrollmentStatus;
  expiresAt: string | null;
  enrolledAt: string;
  completedAt: string | null;
}

export interface Coupon {
  id: string;
  creatorId: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
}

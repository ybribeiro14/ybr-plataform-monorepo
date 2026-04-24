export const SWAGGER_TAGS = {
  HEALTH: "health",
  AUTH: "auth",
  ADMIN_COURSES: "admin/courses",
  ADMIN_MODULES: "admin/modules",
  ADMIN_LESSONS: "admin/lessons",
  STUDENT: "student",
  PUBLIC: "public",
  PAYMENTS: "payments",
  COUPONS: "coupons",
  CERTIFICATES: "certificates",
} as const;

export type SwaggerTag = (typeof SWAGGER_TAGS)[keyof typeof SWAGGER_TAGS];

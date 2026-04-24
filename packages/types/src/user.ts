export type UserRole = "student" | "creator" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export type CreatorPlan = "starter" | "growth" | "pro" | "agency";

export interface Creator {
  id: string;
  userId: string;
  bio: string | null;
  website: string | null;
  plan: CreatorPlan;
  createdAt: string;
}

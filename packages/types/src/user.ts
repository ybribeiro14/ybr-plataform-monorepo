export type UserRole = "student" | "creator" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  isProfileComplete?: boolean;
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

export type StudentGender =
  | "female"
  | "male"
  | "nonbinary"
  | "prefer_not_to_say";

export interface StudentProfile {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  cpf: string | null;
  birthDate: string | null;
  gender: StudentGender | null;
  bio: string | null;
  country: string | null;
  zipCode: string | null;
  street: string | null;
  streetNumber: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  linkedinUrl: string | null;
  instagramHandle: string | null;
  isProfileComplete: boolean;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender?: StudentGender;
  bio?: string;
  country?: string;
  zipCode?: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  linkedinUrl?: string;
  instagramHandle?: string;
}

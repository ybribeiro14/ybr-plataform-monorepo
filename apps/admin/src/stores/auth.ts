"use client";

import { create } from "zustand";

const ACCESS_TOKEN_COOKIE = "ybr_access_token";
const REFRESH_TOKEN_KEY = "ybr_admin_refresh_token";

const setAccessTokenCookie = (token: string) => {
  // biome-ignore lint/suspicious/noDocumentCookie: required for Next.js middleware to read the auth cookie
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; max-age=900; SameSite=Lax`;
};

const clearAccessTokenCookie = () => {
  // biome-ignore lint/suspicious/noDocumentCookie: required for Next.js middleware to clear the auth cookie
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "creator" | "admin";
}

interface AdminAuthState {
  user: AdminUser | null;
  accessToken: string | null;
  setAuth: (
    user: AdminUser,
    accessToken: string,
    refreshToken?: string,
  ) => void;
  logout: () => void;
  getRefreshToken: () => string | null;
}

const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken, refreshToken) => {
    setAccessTokenCookie(accessToken);
    // biome-ignore lint/suspicious/noDocumentCookie: role cookie required for Next.js middleware route protection
    document.cookie = `ybr_user_role=${user.role}; path=/; max-age=900; SameSite=Lax`;
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    set({ user, accessToken });
  },

  logout: () => {
    clearAccessTokenCookie();
    // biome-ignore lint/suspicious/noDocumentCookie: clear role cookie on logout
    document.cookie = "ybr_user_role=; path=/; max-age=0; SameSite=Lax";
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ user: null, accessToken: null });
  },

  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
}));

export { useAdminAuthStore };

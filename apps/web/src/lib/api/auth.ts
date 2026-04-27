import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@ybr/schemas";
import type { ApiResponse, User } from "@ybr/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RefreshResponseData {
  accessToken: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const body: ApiResponse<T> = await response.json();

  if (!response.ok || body.status === "error") {
    const errorCode = body.errors?.[0]?.code;
    if (errorCode === "EMAIL_ALREADY_EXISTS") {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
    throw new Error(body.message ?? "An unexpected error occurred");
  }

  return body.data as T;
};

const login = async (body: LoginInput): Promise<LoginResponseData> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<LoginResponseData>(response);
};

const register = async (body: RegisterInput): Promise<User> => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<User>(response);
};

const forgotPassword = async (body: ForgotPasswordInput): Promise<void> => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleResponse<{ message: string }>(response);
};

const resetPassword = async (body: ResetPasswordInput): Promise<void> => {
  const response = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleResponse<{ message: string }>(response);
};

const getMe = async (accessToken: string): Promise<User> => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<User>(response);
};

const refreshTokenRequest = async (
  token: string,
): Promise<RefreshResponseData> => {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: token }),
  });
  return handleResponse<RefreshResponseData>(response);
};

const logout = async (accessToken: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await handleResponse<{ message: string }>(response);
};

export const authApi = {
  login,
  register,
  forgotPassword,
  resetPassword,
  getMe,
  refreshToken: refreshTokenRequest,
  logout,
};

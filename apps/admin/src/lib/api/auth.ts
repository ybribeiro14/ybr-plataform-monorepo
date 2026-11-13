import type { LoginInput } from "@ybr/schemas";
import type { ApiResponse } from "@ybr/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface RefreshResponseData {
  accessToken: string;
}

interface MeResponseData {
  id: string;
  email: string;
  name: string;
  role: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const body: ApiResponse<T> = await response.json();

  if (!response.ok || body.status === "error") {
    throw new Error(body.message ?? "Ocorreu um erro inesperado");
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

const logout = async (refreshToken: string): Promise<void> => {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
};

const refresh = async (refreshToken: string): Promise<RefreshResponseData> => {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse<RefreshResponseData>(response);
};

const getMe = async (accessToken: string): Promise<MeResponseData> => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<MeResponseData>(response);
};

const adminAuthApi = { login, logout, refresh, getMe };

export { adminAuthApi };

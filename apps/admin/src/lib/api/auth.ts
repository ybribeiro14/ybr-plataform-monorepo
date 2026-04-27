import type { LoginInput } from '@ybr/schemas'
import type { ApiResponse } from '@ybr/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'

interface LoginResponseData {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const body: ApiResponse<T> = await response.json()

  if (!response.ok || body.status === 'error') {
    throw new Error(body.message ?? 'Ocorreu um erro inesperado')
  }

  return body.data as T
}

const login = async (body: LoginInput): Promise<LoginResponseData> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<LoginResponseData>(response)
}

const logout = async (refreshToken: string): Promise<void> => {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
}

const adminAuthApi = { login, logout }

export { adminAuthApi }

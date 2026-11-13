import type { ApiResponse } from '@ybr/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'

interface CreatorProfile {
  userId: string
  email: string
  name: string
  avatarUrl: string | null
  preferredLocale: string
  creatorId: string
  bio: string | null
  website: string | null
  phone: string | null
  cpf: string | null
  birthDate: string | null
  gender: string | null
  country: string | null
  zipCode: string | null
  street: string | null
  streetNumber: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
}

interface CreatorBranding {
  brandName: string | null
  logoUrl: string | null
  primaryColor: string | null
  onPrimaryColor: string | null
  accentColor: string | null
  onAccentColor: string | null
  sidebarBgColor: string | null
  onSidebarColor: string | null
}

interface UpdateProfileInput {
  name?: string
  bio?: string | null
  website?: string | null
  phone?: string | null
  cpf?: string | null
  birthDate?: string | null
  gender?: 'female' | 'male' | 'nonbinary' | 'prefer_not_to_say' | null
  country?: string | null
  zipCode?: string | null
  street?: string | null
  streetNumber?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
}

interface UpdateBrandingInput {
  brandName?: string
  primaryColor?: string
  onPrimaryColor?: string
  accentColor?: string
  onAccentColor?: string
  sidebarBgColor?: string
  onSidebarColor?: string
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const body: ApiResponse<T> = await response.json()
  if (!response.ok || body.status === 'error') {
    throw new Error(body.message ?? 'Ocorreu um erro inesperado')
  }
  return body.data as T
}

const getProfile = async (token: string): Promise<CreatorProfile> => {
  const response = await fetch(`${BASE_URL}/admin/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  return handleResponse<CreatorProfile>(response)
}

const updateProfile = async (
  token: string,
  data: UpdateProfileInput
): Promise<{ success: boolean }> => {
  const response = await fetch(`${BASE_URL}/admin/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return handleResponse<{ success: boolean }>(response)
}

const uploadAvatar = async (token: string, file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${BASE_URL}/admin/profile/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return handleResponse<{ avatarUrl: string }>(response)
}

const getBranding = async (token: string): Promise<CreatorBranding> => {
  const response = await fetch(`${BASE_URL}/admin/branding`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  return handleResponse<CreatorBranding>(response)
}

const updateBranding = async (
  token: string,
  data: UpdateBrandingInput
): Promise<{ success: boolean }> => {
  const response = await fetch(`${BASE_URL}/admin/branding`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return handleResponse<{ success: boolean }>(response)
}

const uploadLogo = async (token: string, file: File): Promise<{ logoUrl: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${BASE_URL}/admin/branding/logo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return handleResponse<{ logoUrl: string }>(response)
}

const updateLanguage = async (
  token: string,
  locale: 'pt-BR' | 'en'
): Promise<{ preferredLocale: string }> => {
  const response = await fetch(`${BASE_URL}/auth/me/language`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ locale }),
  })
  return handleResponse<{ preferredLocale: string }>(response)
}

const adminSettingsApi = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getBranding,
  updateBranding,
  uploadLogo,
  updateLanguage,
}

export type { CreatorBranding, CreatorProfile, UpdateBrandingInput, UpdateProfileInput }
export { adminSettingsApi }

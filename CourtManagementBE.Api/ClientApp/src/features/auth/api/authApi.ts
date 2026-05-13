import type { AuthUser, LoginRequest, LoginResponse } from '@/features/auth/model/types'
import { apiGet, apiPost } from '@/services/api/apiClient'

export const login = async (payload: LoginRequest) => {
  return apiPost<LoginResponse>('/auth/login', payload)
}

export const getCurrentUser = async () => {
  return apiGet<AuthUser>('/auth/me')
}

export const logout = async () => {
  return apiPost<void>('/auth/logout')
}

import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import type { AuthUser } from '@/features/auth/model/types'
import { storage } from '@/utils/storage'

export const authStorage = {
  getToken: () => storage.get<string>(AUTH_STORAGE_KEYS.token),
  getUser: () => storage.get<AuthUser>(AUTH_STORAGE_KEYS.user),
  setSession(token: string, user: AuthUser) {
    storage.set(AUTH_STORAGE_KEYS.token, token)
    storage.set(AUTH_STORAGE_KEYS.user, user)
  },
  clearSession() {
    storage.remove(AUTH_STORAGE_KEYS.token)
    storage.remove(AUTH_STORAGE_KEYS.user)
    storage.remove(AUTH_STORAGE_KEYS.workingFacilityId)
  },
}

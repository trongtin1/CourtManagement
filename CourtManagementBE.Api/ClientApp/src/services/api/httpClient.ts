import axios from 'axios'

import { env } from '@/config/env'
import { AUTH_EVENTS, AUTH_STORAGE_KEYS } from '@/constants/auth'
import { storage } from '@/utils/storage'

declare module 'axios' {
  export interface AxiosRequestConfig {
    idempotent?: boolean
  }
}

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

httpClient.interceptors.request.use((config) => {
  const token = storage.get<string>(AUTH_STORAGE_KEYS.token)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const workingFacilityId = storage.get<string>(AUTH_STORAGE_KEYS.workingFacilityId)

  if (workingFacilityId && workingFacilityId !== 'all') {
    config.headers['X-Facility-Id'] = workingFacilityId
  }

  if (config.idempotent && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
          })
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      storage.remove(AUTH_STORAGE_KEYS.token)
      storage.remove(AUTH_STORAGE_KEYS.user)
      window.dispatchEvent(new Event(AUTH_EVENTS.unauthorized))
    }

    return Promise.reject(error)
  },
)

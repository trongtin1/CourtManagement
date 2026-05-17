import axios from 'axios'

import { env } from '@/config/env'
import { AUTH_EVENTS, AUTH_STORAGE_KEYS } from '@/constants/auth'
import { storage } from '@/utils/storage'

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

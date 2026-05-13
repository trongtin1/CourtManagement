import axios from 'axios'

import type { ApiError } from '@/types/api'

type ErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
  title?: string
}

export const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    const payload = error.response?.data

    return {
      status: error.response?.status,
      message:
        payload?.message ||
        payload?.title ||
        error.message ||
        'Request failed. Please try again.',
      errors: payload?.errors,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: 'Unexpected error. Please try again.',
  }
}

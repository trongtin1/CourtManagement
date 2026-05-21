import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api'
import { httpClient } from '@/services/api/httpClient'

export type ApiRequestConfig = Pick<AxiosRequestConfig, 'signal' | 'headers' | 'timeout'>

export type AbortableRequest<T> = {
  promise: Promise<T>
  abort: () => void
  signal: AbortSignal
}

/**
 * Generic CRUD helpers that unwrap the BE Result<T> envelope.
 * Every BE response has shape: { statusCode, isSuccess, message, data }
 */
export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: ApiRequestConfig,
): Promise<T> {
  const res = await httpClient.get<ApiResponse<T>>(url, { ...config, params })
  return res.data.data
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const res = await httpClient.post<ApiResponse<T>>(url, body, config)
  return res.data.data
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const res = await httpClient.put<ApiResponse<T>>(url, body, config)
  return res.data.data
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const res = await httpClient.patch<ApiResponse<T>>(url, body, config)
  return res.data.data
}

export async function apiDelete<T = void>(url: string, config?: ApiRequestConfig): Promise<T> {
  const res = await httpClient.delete<ApiResponse<T>>(url, config)
  return res.data.data
}

export function createAbortableRequest<T>(
  request: (signal: AbortSignal) => Promise<T>,
): AbortableRequest<T> {
  const controller = new AbortController()

  return {
    promise: request(controller.signal),
    abort: () => controller.abort(),
    signal: controller.signal,
  }
}

export const isAbortError = (error: unknown) => {
  return (
    error instanceof DOMException ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ERR_CANCELED')
  )
}
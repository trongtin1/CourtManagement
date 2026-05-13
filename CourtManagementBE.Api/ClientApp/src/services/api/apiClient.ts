import type { ApiResponse } from '@/types/api'
import { httpClient } from '@/services/api/httpClient'

/**
 * Generic CRUD helpers that unwrap the BE Result<T> envelope.
 * Every BE response has shape: { statusCode, isSuccess, message, data }
 */

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await httpClient.get<ApiResponse<T>>(url, { params })
  return res.data.data
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await httpClient.post<ApiResponse<T>>(url, body)
  return res.data.data
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await httpClient.put<ApiResponse<T>>(url, body)
  return res.data.data
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const res = await httpClient.patch<ApiResponse<T>>(url, body)
  return res.data.data
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const res = await httpClient.delete<ApiResponse<T>>(url)
  return res.data.data
}

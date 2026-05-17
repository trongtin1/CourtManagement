import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../model/types'
export const unitApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Unit>>('/Unit', params),
  getById: (id: number) => apiGet<Unit>(`/Unit/${id}`),
  create: (data: CreateUnitRequest) => apiPost<Unit>('/Unit', data),
  update: (id: number, data: UpdateUnitRequest) => apiPut<Unit>(`/Unit/${id}`, data),
  delete: (id: number) => apiDelete(`/Unit/${id}`),
}

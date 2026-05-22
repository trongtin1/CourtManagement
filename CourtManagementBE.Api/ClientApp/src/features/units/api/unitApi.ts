import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Unit, UnitRequest } from '../model/types'

export const unitApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Unit>>('/Unit', params),
  getById: (id: number) => apiGet<Unit>(`/Unit/${id}`),
  create: (data: UnitRequest) => apiPost<Unit>('/Unit', data),
  update: (id: number, data: UnitRequest) => apiPut<Unit>(`/Unit/${id}`, data),
  delete: (id: number) => apiDelete(`/Unit/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { CreateUtilityRequest, UpdateUtilityRequest, Utility } from '../model/types'

export const utilityApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Utility>>('/utility', params),
  getById: (id: number) => apiGet<Utility>(`/utility/${id}`),
  create: (data: CreateUtilityRequest) => apiPost<Utility>('/utility', data),
  update: (id: number, data: UpdateUtilityRequest) =>
    apiPut<Utility>(`/utility/${id}`, data),
  delete: (id: number) => apiDelete(`/utility/${id}`),
}

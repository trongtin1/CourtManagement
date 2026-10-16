import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Area, CreateAreaRequest, UpdateAreaRequest } from '../model/types'

export const areaApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Area>>('/area', params),
  getById: (id: number) => apiGet<Area>(`/area/${id}`),
  create: (data: CreateAreaRequest) => apiPost<Area>('/area', data),
  update: (id: number, data: UpdateAreaRequest) => apiPut<Area>(`/area/${id}`, data),
  delete: (id: number) => apiDelete(`/area/${id}`),
}

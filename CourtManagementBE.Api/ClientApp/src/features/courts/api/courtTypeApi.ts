import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { CourtType, CreateCourtTypeRequest, UpdateCourtTypeRequest } from '../model/types'


export const courtTypeApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<CourtType>>('/courttype', params),
  getById: (id: number) => apiGet<CourtType>(`/courttype/${id}`),
  create: (data: CreateCourtTypeRequest) => apiPost<CourtType>('/courttype', data),
  update: (id: number, data: UpdateCourtTypeRequest) =>
    apiPut<CourtType>(`/courttype/${id}`, data),
  delete: (id: number) => apiDelete(`/courttype/${id}`),
}

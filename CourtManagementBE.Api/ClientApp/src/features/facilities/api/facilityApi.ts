import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Facility, FacilityRequest } from '../model/types'

export const facilityApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Facility>>('/facility', params),
  getById: (id: number) => apiGet<Facility>(`/facility/${id}`),
  create: (data: FacilityRequest) => apiPost<Facility>('/facility', data),
  update: (id: number, data: FacilityRequest) =>
    apiPut<Facility>(`/facility/${id}`, data),
  toggleActive: (id: number) => apiPatch<Facility>(`/facility/${id}/toggle-active`),
  delete: (id: number) => apiDelete(`/facility/${id}`),
}

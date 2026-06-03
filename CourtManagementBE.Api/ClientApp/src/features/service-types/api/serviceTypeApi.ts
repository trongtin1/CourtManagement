import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { ServiceType, ServiceTypeRequest } from '../model/types'
export const serviceTypeApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<ServiceType>>('/ServiceType', params),
  create: (data: ServiceTypeRequest) => apiPost<ServiceType>('/ServiceType', data),
  update: (id: number, data: ServiceTypeRequest) =>
    apiPut<ServiceType>(`/ServiceType/${id}`, data),
  delete: (id: number) => apiDelete(`/ServiceType/${id}`),
}

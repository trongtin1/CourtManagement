import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { ServiceType, CreateServiceTypeRequest, UpdateServiceTypeRequest } from '../model/types'
export const serviceTypeApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<ServiceType>>('/ServiceType', params),
  getById: (id: number) => apiGet<ServiceType>(`/ServiceType/${id}`),
  create: (data: CreateServiceTypeRequest) => apiPost<ServiceType>('/ServiceType', data),
  update: (id: number, data: UpdateServiceTypeRequest) => apiPut<ServiceType>(`/ServiceType/${id}`, data),
  delete: (id: number) => apiDelete(`/ServiceType/${id}`),
}

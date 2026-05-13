import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '../model/types'


export const serviceApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Service>>('/service', params),
  getById: (id: number) => apiGet<Service>(`/service/${id}`),
  getByTenant: (tenantId: number) => apiGet<Service[]>(`/service/tenant/${tenantId}`),
  create: (data: CreateServiceRequest) => apiPost<Service>('/service', data),
  update: (id: number, data: UpdateServiceRequest) => apiPut<Service>(`/service/${id}`, data),
  toggleActive: (id: number) => apiPatch<Service>(`/service/${id}/toggle-active`),
  delete: (id: number) => apiDelete(`/service/${id}`),
}

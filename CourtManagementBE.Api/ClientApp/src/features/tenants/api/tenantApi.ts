import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  CreateTenantRequest,
  Tenant,
  UpdateTenantRequest,
} from '../model/types'

export const tenantApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Tenant>>('/tenant', params),

  getById: (id: number) => apiGet<Tenant>(`/tenant/${id}`),

  create: (data: CreateTenantRequest) =>
    apiPost<Tenant>('/tenant', data),

  update: (id: number, data: UpdateTenantRequest) =>
    apiPut<Tenant>(`/tenant/${id}`, data),

  delete: (id: number) =>
    apiDelete(`/tenant/${id}`),
}

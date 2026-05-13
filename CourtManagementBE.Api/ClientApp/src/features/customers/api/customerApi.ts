import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../model/types'


export const customerApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Customer>>('/customer', params),
  getById: (id: number) => apiGet<Customer>(`/customer/${id}`),
  getByTenant: (tenantId: number) => apiGet<Customer[]>(`/customer/tenant/${tenantId}`),
  search: (phone: string) => apiGet<Customer[]>(`/customer/search`, { phone }),
  create: (data: CreateCustomerRequest) => apiPost<Customer>('/customer', data),
  update: (id: number, data: UpdateCustomerRequest) => apiPut<Customer>(`/customer/${id}`, data),
  delete: (id: number) => apiDelete(`/customer/${id}`),
}

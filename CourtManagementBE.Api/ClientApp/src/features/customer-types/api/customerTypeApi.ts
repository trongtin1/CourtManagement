import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { CustomerType, CreateCustomerTypeRequest, UpdateCustomerTypeRequest } from '../model/types'
export const customerTypeApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<CustomerType>>('/CustomerType', params),
  getById: (id: number) => apiGet<CustomerType>(`/CustomerType/${id}`),
  create: (data: CreateCustomerTypeRequest) => apiPost<CustomerType>('/CustomerType', data),
  update: (id: number, data: UpdateCustomerTypeRequest) => apiPut<CustomerType>(`/CustomerType/${id}`, data),
  delete: (id: number) => apiDelete(`/CustomerType/${id}`),
}

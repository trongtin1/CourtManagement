import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { CustomerType, CustomerTypeRequest } from '../model/types'
export const customerTypeApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<CustomerType>>('/CustomerType', params),
  getById: (id: number) => apiGet<CustomerType>(`/CustomerType/${id}`),
  create: (data: CustomerTypeRequest) => apiPost<CustomerType>('/CustomerType', data),
  update: (id: number, data: CustomerTypeRequest) =>
    apiPut<CustomerType>(`/CustomerType/${id}`, data),
  delete: (id: number) => apiDelete(`/CustomerType/${id}`),
}

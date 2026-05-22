import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { PaymentMethod, PaymentMethodRequest } from '../model/types'

export const paymentMethodApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<PaymentMethod>>('/PaymentMethod', params),
  getById: (id: number) => apiGet<PaymentMethod>(`/PaymentMethod/${id}`),
  create: (data: PaymentMethodRequest) => apiPost<PaymentMethod>('/PaymentMethod', data),
  update: (id: number, data: PaymentMethodRequest) =>
    apiPut<PaymentMethod>(`/PaymentMethod/${id}`, data),
  delete: (id: number) => apiDelete(`/PaymentMethod/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { PaymentStatus, PaymentStatusRequest } from '../model/types'

export const paymentStatusApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<PaymentStatus>>('/PaymentStatus', params),
  create: (data: PaymentStatusRequest) => apiPost<PaymentStatus>('/PaymentStatus', data),
  update: (id: number, data: PaymentStatusRequest) =>
    apiPut<PaymentStatus>(`/PaymentStatus/${id}`, data),
  delete: (id: number) => apiDelete(`/PaymentStatus/${id}`),
}

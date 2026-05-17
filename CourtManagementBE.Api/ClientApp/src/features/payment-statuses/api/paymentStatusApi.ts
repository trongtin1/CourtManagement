import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { PaymentStatus, CreatePaymentStatusRequest, UpdatePaymentStatusRequest } from '../model/types'

export const paymentStatusApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<PaymentStatus>>('/PaymentStatus', params),
  getById: (id: number) => apiGet<PaymentStatus>(`/PaymentStatus/${id}`),
  create: (data: CreatePaymentStatusRequest) => apiPost<PaymentStatus>('/PaymentStatus', data),
  update: (id: number, data: UpdatePaymentStatusRequest) => apiPut<PaymentStatus>(`/PaymentStatus/${id}`, data),
  delete: (id: number) => apiDelete(`/PaymentStatus/${id}`),
}

import { apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Payment, CreatePaymentRequest, UpdatePaymentRequest } from '../model/types'


export const paymentApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Payment>>('/payment', params),
  getById: (id: number) => apiGet<Payment>(`/payment/${id}`),
  getByBooking: (bookingId: string) => apiGet<Payment[]>(`/payment/booking/${bookingId}`),
  create: (data: CreatePaymentRequest) => apiPost<Payment>('/payment', data),
  update: (id: number, data: UpdatePaymentRequest) => apiPut<Payment>(`/payment/${id}`, data),
}

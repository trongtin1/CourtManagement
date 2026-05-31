import { apiGet } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Payment } from '../model/types'


export const paymentApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Payment>>('/payment', params),
  getById: (id: number) => apiGet<Payment>(`/payment/${id}`),
  getByBooking: (bookingId: string) => apiGet<Payment[]>(`/payment/booking/${bookingId}`),
}

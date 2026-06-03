import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { BookingStatus, BookingStatusRequest } from '../model/types'

export const bookingStatusApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<BookingStatus>>('/BookingStatus', params),
  create: (data: BookingStatusRequest) => apiPost<BookingStatus>('/BookingStatus', data),
  update: (id: number, data: BookingStatusRequest) =>
    apiPut<BookingStatus>(`/BookingStatus/${id}`, data),
  delete: (id: number) => apiDelete(`/BookingStatus/${id}`),
}

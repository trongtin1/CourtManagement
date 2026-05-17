import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { BookingStatus, CreateBookingStatusRequest, UpdateBookingStatusRequest } from '../model/types'

export const bookingStatusApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<BookingStatus>>('/BookingStatus', params),
  getById: (id: number) => apiGet<BookingStatus>(`/BookingStatus/${id}`),
  create: (data: CreateBookingStatusRequest) => apiPost<BookingStatus>('/BookingStatus', data),
  update: (id: number, data: UpdateBookingStatusRequest) => apiPut<BookingStatus>(`/BookingStatus/${id}`, data),
  delete: (id: number) => apiDelete(`/BookingStatus/${id}`),
}

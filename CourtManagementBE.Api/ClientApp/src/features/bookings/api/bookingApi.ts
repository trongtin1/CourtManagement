import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  Booking,
  CreateBookingRequest,
  CreateFullBookingRequest,
  UpdateBookingRequest,
  CancelBookingRequest,
} from '../model/types'


export const bookingApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Booking>>('/booking', params),
  getById: (id: string) => apiGet<Booking>(`/booking/${id}`),
  getByCustomer: (customerId: number) => apiGet<Booking[]>(`/booking/customer/${customerId}`),
  getByCourt: (courtId: number) => apiGet<Booking[]>(`/booking/court/${courtId}`),
  getByStatus: (status: string) => apiGet<Booking[]>(`/booking/status/${status}`),
  getByDate: (date: string) => apiGet<Booking[]>(`/booking/date/${date}`),
  create: (data: CreateBookingRequest) => apiPost<Booking>('/booking', data),
  createFull: (data: CreateFullBookingRequest) => apiPost<Booking>('/booking/full', data),
  update: (id: string, data: UpdateBookingRequest) => apiPut<Booking>(`/booking/${id}`, data),
  cancel: (id: string, data: CancelBookingRequest) => apiPatch<Booking>(`/booking/${id}/cancel`, data),
  delete: (id: string) => apiDelete(`/booking/${id}`),
}

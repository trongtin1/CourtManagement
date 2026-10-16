import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type {
  BookingService,
  BulkUpdateBookingServiceItemRequest,
  CreateBookingServiceRequest,
  UpdateBookingServiceRequest,
} from '../model/types'

export const bookingServiceApi = {
  getByBooking: (bookingId: string) =>
    apiGet<BookingService[]>(`/bookingservice/booking/${bookingId}`),
  create: (data: CreateBookingServiceRequest) =>
    apiPost<BookingService>(`/bookingservice`, data),
  update: (id: number, data: UpdateBookingServiceRequest) =>
    apiPut<BookingService>(`/bookingservice/${id}`, data),
  bulkUpdate: (bookingId: string, data: BulkUpdateBookingServiceItemRequest[]) =>
    apiPut<BookingService[]>(`/bookingservice/booking/${bookingId}/bulk`, data),
  delete: (id: number) => apiDelete(`/bookingservice/${id}`),
}

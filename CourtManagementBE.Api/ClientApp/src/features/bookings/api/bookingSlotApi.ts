import { apiDelete, apiGet, apiPost } from '@/services/api/apiClient'
import type { BookingSlot, CreateBookingSlotRequest } from '../model/types'

export const bookingSlotApi = {
  getByBooking: (bookingId: string) => apiGet<BookingSlot[]>(`/bookingslot/booking/${bookingId}`),
  getByCourtAndDate: (courtId: number, date: string) => apiGet<BookingSlot[]>(`/bookingslot/court/${courtId}/date/${date}`),
  getByDate: (date: string) => apiGet<BookingSlot[]>(`/bookingslot/date/${date}`),
  create: (data: CreateBookingSlotRequest) => apiPost<BookingSlot>(`/bookingslot`, data),
  delete: (id: number) => apiDelete(`/bookingslot/${id}`),
}

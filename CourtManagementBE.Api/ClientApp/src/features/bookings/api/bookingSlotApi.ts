import { apiDelete, apiGet, apiPost } from '@/services/api/apiClient'
import type { BookingSlot, CreateBookingSlotRequest } from '../model/types'

export const bookingSlotApi = {
  getByBooking: (bookingId: string) => apiGet<BookingSlot[]>(`/bookingslot/booking/${bookingId}`),
  create: (data: CreateBookingSlotRequest) => apiPost<BookingSlot>(`/bookingslot`, data),
  delete: (id: number) => apiDelete(`/bookingslot/${id}`),
}

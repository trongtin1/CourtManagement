import { apiGet } from '@/services/api/apiClient'
import type { BookingSlot } from '../model/types'

export const bookingSlotApi = {
  getByBooking: (bookingId: string) =>
    apiGet<BookingSlot[]>(`/bookingslot/booking/${bookingId}`),
  getByCourtAndDate: (courtId: number, date: string) =>
    apiGet<BookingSlot[]>(`/bookingslot/court/${courtId}/date/${date}`),
  getByDate: (date: string) => apiGet<BookingSlot[]>(`/bookingslot/date/${date}`),
}

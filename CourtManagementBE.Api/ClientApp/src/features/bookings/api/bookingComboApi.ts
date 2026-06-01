import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type {
  BookingCombo,
  BulkUpdateBookingComboItemRequest,
  CreateBookingComboRequest,
  UpdateBookingComboRequest,
} from '../model/types'

export const bookingComboApi = {
  getByBooking: (bookingId: string) =>
    apiGet<BookingCombo[]>(`/bookingcombo/booking/${bookingId}`),
  create: (data: CreateBookingComboRequest) =>
    apiPost<BookingCombo>(`/bookingcombo`, data),
  update: (id: number, data: UpdateBookingComboRequest) =>
    apiPut<BookingCombo>(`/bookingcombo/${id}`, data),
  bulkUpdate: (bookingId: string, data: BulkUpdateBookingComboItemRequest[]) =>
    apiPut<BookingCombo[]>(`/bookingcombo/booking/${bookingId}/bulk`, data),
  delete: (id: number) => apiDelete(`/bookingcombo/${id}`),
}

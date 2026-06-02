import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  BookingGroup,
  CreateBookingGroupRequest,
} from '../model/types'

export const bookingGroupApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<BookingGroup>>('/bookinggroup', params),
  getById: (id: number) => apiGet<BookingGroup>(`/bookinggroup/${id}`),
  getByCustomer: (customerId: number) => apiGet<BookingGroup[]>(`/bookinggroup/customer/${customerId}`),
  create: (data: CreateBookingGroupRequest) => apiPost<string>('/bookinggroup', data),
  update: (id: number, data: CreateBookingGroupRequest) => apiPut<BookingGroup>(`/bookinggroup/${id}`, data),
  cancel: (id: number, reason: string) => apiPatch<BookingGroup>(`/bookinggroup/${id}/cancel`, reason),
  delete: (id: number) => apiDelete(`/bookinggroup/${id}`),
}

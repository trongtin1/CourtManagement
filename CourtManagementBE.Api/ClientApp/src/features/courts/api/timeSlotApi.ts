import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { CreateTimeSlotRequest, TimeSlot, UpdateTimeSlotRequest } from '../model/types'

export const timeSlotApi = {
  getAll: (params: PaginationQuery = { page: 1, pageSize: 1000 }) =>
    apiGet<PageList<TimeSlot>>('/timeslot', params),
  getById: (id: number) => apiGet<TimeSlot>(`/timeslot/${id}`),
  create: (data: CreateTimeSlotRequest) => apiPost<TimeSlot>('/timeslot', data),
  update: (id: number, data: UpdateTimeSlotRequest) =>
    apiPut<TimeSlot>(`/timeslot/${id}`, data),
  delete: (id: number) => apiDelete(`/timeslot/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  CourtLockedSlot,
  CreateCourtLockedSlotRequest,
  UpdateCourtLockedSlotRequest,
} from '../model/types'

export const courtLockedSlotApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<CourtLockedSlot>>('/courtlockedslot', params),
  getById: (id: number) => apiGet<CourtLockedSlot>(`/courtlockedslot/${id}`),
  getByCourt: (courtId: number, targetDate?: string | null) =>
    apiGet<CourtLockedSlot[]>(`/courtlockedslot/court/${courtId}`, {
      targetDate: targetDate || undefined,
    }),
  getAvailabilityBlocks: (courtId: number, targetDate: string) =>
    apiGet<CourtLockedSlot[]>(`/courtlockedslot/court/${courtId}/availability`, {
      targetDate,
    }),
  create: (data: CreateCourtLockedSlotRequest) =>
    apiPost<CourtLockedSlot>('/courtlockedslot', data),
  update: (id: number, data: UpdateCourtLockedSlotRequest) =>
    apiPut<CourtLockedSlot>(`/courtlockedslot/${id}`, data),
  delete: (id: number) => apiDelete(`/courtlockedslot/${id}`),
}
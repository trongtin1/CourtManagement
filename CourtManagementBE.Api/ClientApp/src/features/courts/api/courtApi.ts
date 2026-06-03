import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  Court,
  CourtSlotAvailability,
  CourtTimelineAvailability,
  CreateCourtRequest,
  UpdateCourtRequest,
} from '../model/types'


export const courtApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Court>>('/court', params),
  getById: (id: number) => apiGet<Court>(`/court/${id}`),
  getSlotsAvailability: (id: number, date: string) =>
    apiGet<CourtSlotAvailability[]>(`/court/${id}/slots`, { date }),
  getTimelineAvailability: (facilityId: number, date: string) =>
    apiGet<CourtTimelineAvailability[]>(`/court/facility/${facilityId}/timeline`, { date }),
  create: (data: CreateCourtRequest) => apiPost<Court>('/court', data),
  update: (id: number, data: UpdateCourtRequest) => apiPut<Court>(`/court/${id}`, data),
  toggleActive: (id: number) => apiPatch<Court>(`/court/${id}/toggle-active`),
  delete: (id: number) => apiDelete(`/court/${id}`),
}

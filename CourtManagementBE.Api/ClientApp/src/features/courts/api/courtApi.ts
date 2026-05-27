import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  Court,
  CourtSlotAvailability,
  CreateCourtRequest,
  UpdateCourtRequest,
} from '../model/types'


export const courtApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Court>>('/court', params),
  getById: (id: number) => apiGet<Court>(`/court/${id}`),
  getByFacility: (facilityId: number) => apiGet<Court[]>(`/court/facility/${facilityId}`),
  getByStatus: (statusId: number) => apiGet<Court[]>(`/court/status/${statusId}`),
  getSlotsAvailability: (id: number, date: string) =>
    apiGet<CourtSlotAvailability[]>(`/court/${id}/slots`, { date }),
  create: (data: CreateCourtRequest) => apiPost<Court>('/court', data),
  update: (id: number, data: UpdateCourtRequest) => apiPut<Court>(`/court/${id}`, data),
  toggleActive: (id: number) => apiPatch<Court>(`/court/${id}/toggle-active`),
  delete: (id: number) => apiDelete(`/court/${id}`),
}

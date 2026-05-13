import { apiDelete, apiGet, apiPost } from '@/services/api/apiClient'
import type { CourtUtility, CreateCourtUtilityRequest } from '../model/types'



export const courtUtilityApi = {
  getByCourt: (courtId: number) =>
    apiGet<CourtUtility[]>(`/courtutility/court/${courtId}`),
  create: (data: CreateCourtUtilityRequest) =>
    apiPost<CourtUtility>(`/courtutility`, data),
  delete: (id: number) => apiDelete(`/courtutility/${id}`),
}

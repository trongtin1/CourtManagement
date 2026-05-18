import { apiDelete, apiGet, apiPost } from '@/services/api/apiClient'
import type {
  CourtFeatureMapping,
  CreateCourtFeatureMappingRequest,
} from '@/features/courts/model/types'

export const courtFeatureMappingApi = {
  getByCourt: (courtId: number) =>
    apiGet<CourtFeatureMapping[]>(`/court/${courtId}/features`),
  create: (courtId: number, data: CreateCourtFeatureMappingRequest) =>
    apiPost<CourtFeatureMapping>(`/court/${courtId}/features`, data),
  delete: (courtId: number, featureId: number) => apiDelete(`/court/${courtId}/feature/${featureId}`),
}

import { apiDelete, apiGet, apiPost } from '@/services/api/apiClient'
import type {
  CourtFeatureMapping,
  CreateCourtFeatureMappingRequest,
} from '@/features/courts/model/types'

export const courtFeatureMappingApi = {
  getByCourt: (courtId: number) =>
    apiGet<CourtFeatureMapping[]>(`/courtfeaturemapping/court/${courtId}`),
  create: (data: CreateCourtFeatureMappingRequest) =>
    apiPost<CourtFeatureMapping>('/courtfeaturemapping', data),
  delete: (id: number) => apiDelete(`/courtfeaturemapping/${id}`),
}

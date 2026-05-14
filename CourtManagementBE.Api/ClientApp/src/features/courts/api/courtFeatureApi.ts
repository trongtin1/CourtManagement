import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  CourtFeature,
  CreateCourtFeatureRequest,
  UpdateCourtFeatureRequest,
} from '../model/types'

export const courtFeatureApi = {
  getAll: (params: PaginationQuery = { page: 1, pageSize: 1000 }) =>
    apiGet<PageList<CourtFeature>>('/courtfeature', params),
  getById: (id: number) => apiGet<CourtFeature>(`/courtfeature/${id}`),
  create: (data: CreateCourtFeatureRequest) =>
    apiPost<CourtFeature>('/courtfeature', data),
  update: (id: number, data: UpdateCourtFeatureRequest) =>
    apiPut<CourtFeature>(`/courtfeature/${id}`, data),
  delete: (id: number) => apiDelete(`/courtfeature/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { CourtFeatureCategory, CourtFeatureCategoryRequest } from '../model/types'
export const courtFeatureCategoryApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<CourtFeatureCategory>>('/CourtFeatureCategory', params),
  create: (data: CourtFeatureCategoryRequest) =>
    apiPost<CourtFeatureCategory>('/CourtFeatureCategory', data),
  update: (id: number, data: CourtFeatureCategoryRequest) =>
    apiPut<CourtFeatureCategory>(`/CourtFeatureCategory/${id}`, data),
  delete: (id: number) => apiDelete(`/CourtFeatureCategory/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  CourtAsset,
  CreateCourtAssetRequest,
  UpdateCourtAssetRequest,
} from '@/features/courts/model/types'

export const courtAssetApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<CourtAsset>>('/courtasset', params),
  getById: (id: number) => apiGet<CourtAsset>(`/courtasset/${id}`),
  getByCourt: (courtId: number) => apiGet<CourtAsset[]>(`/courtasset/court/${courtId}`),
  create: (data: CreateCourtAssetRequest) => apiPost<CourtAsset>('/courtasset', data),
  update: (id: number, data: UpdateCourtAssetRequest) =>
    apiPut<CourtAsset>(`/courtasset/${id}`, data),
  delete: (id: number) => apiDelete(`/courtasset/${id}`),
}

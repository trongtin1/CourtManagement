import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { AssetCondition, CreateAssetConditionRequest, UpdateAssetConditionRequest } from '../model/types'
export const assetConditionApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<AssetCondition>>('/AssetCondition', params),
  getById: (id: number) => apiGet<AssetCondition>(`/AssetCondition/${id}`),
  create: (data: CreateAssetConditionRequest) => apiPost<AssetCondition>('/AssetCondition', data),
  update: (id: number, data: UpdateAssetConditionRequest) => apiPut<AssetCondition>(`/AssetCondition/${id}`, data),
  delete: (id: number) => apiDelete(`/AssetCondition/${id}`),
}

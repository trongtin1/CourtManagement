import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { AssetCondition, AssetConditionRequest } from '../model/types'

export const assetConditionApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<AssetCondition>>('/AssetCondition', params),
  create: (data: AssetConditionRequest) =>
    apiPost<AssetCondition>('/AssetCondition', data),
  update: (id: number, data: AssetConditionRequest) =>
    apiPut<AssetCondition>(`/AssetCondition/${id}`, data),
  delete: (id: number) => apiDelete(`/AssetCondition/${id}`),
}

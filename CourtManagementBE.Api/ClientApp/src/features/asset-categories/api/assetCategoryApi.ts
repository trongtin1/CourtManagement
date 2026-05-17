import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { AssetCategory, CreateAssetCategoryRequest, UpdateAssetCategoryRequest } from '../model/types'
export const assetCategoryApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<AssetCategory>>('/AssetCategory', params),
  getById: (id: number) => apiGet<AssetCategory>(`/AssetCategory/${id}`),
  create: (data: CreateAssetCategoryRequest) => apiPost<AssetCategory>('/AssetCategory', data),
  update: (id: number, data: UpdateAssetCategoryRequest) => apiPut<AssetCategory>(`/AssetCategory/${id}`, data),
  delete: (id: number) => apiDelete(`/AssetCategory/${id}`),
}

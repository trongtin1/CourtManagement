import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { AssetCategory, AssetCategoryRequest } from '../model/types'
export const assetCategoryApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<AssetCategory>>('/AssetCategory', params),
  getById: (id: number) => apiGet<AssetCategory>(`/AssetCategory/${id}`),
  create: (data: AssetCategoryRequest) => apiPost<AssetCategory>('/AssetCategory', data),
  update: (id: number, data: AssetCategoryRequest) =>
    apiPut<AssetCategory>(`/AssetCategory/${id}`, data),
  delete: (id: number) => apiDelete(`/AssetCategory/${id}`),
}

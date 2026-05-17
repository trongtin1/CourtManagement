import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assetCategoryApi } from './assetCategoryApi'
import type { PaginationQuery } from '@/types/api'
import type { AssetCategory, CreateAssetCategoryRequest, UpdateAssetCategoryRequest } from '../model/types'
export const assetCategoryKeys = { all: ['assetCategories'] as const, list: (p?: PaginationQuery) => [...assetCategoryKeys.all, 'list', p] as const }
export const useAssetCategoriesQuery = (params?: PaginationQuery) => useQuery({ queryKey: assetCategoryKeys.list(params), queryFn: () => assetCategoryApi.getAll(params) })
export const useCreateAssetCategoryMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: CreateAssetCategoryRequest) => assetCategoryApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: assetCategoryKeys.all }) }) }
export const useUpdateAssetCategoryMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: number; data: UpdateAssetCategoryRequest }) => assetCategoryApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: assetCategoryKeys.all }) }) }
export const useToggleAssetCategoryMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (r: AssetCategory) => assetCategoryApi.update(r.assetCategoryID, { code: r.code, name: r.name, description: r.description, sortOrder: r.sortOrder, isActive: !r.isActive }), onSuccess: () => qc.invalidateQueries({ queryKey: assetCategoryKeys.all }) }) }
export const useDeleteAssetCategoryMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => assetCategoryApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: assetCategoryKeys.all }) }) }

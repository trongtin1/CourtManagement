import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assetConditionApi } from './assetConditionApi'
import type { PaginationQuery } from '@/types/api'
import type { AssetCondition, AssetConditionRequest } from '../model/types'
export const assetConditionKeys = {
  all: ['assetConditions'] as const,
  list: (p?: PaginationQuery) => [...assetConditionKeys.all, 'list', p] as const,
}
export const useAssetConditionsQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: assetConditionKeys.list(params),
    queryFn: () => assetConditionApi.getAll(params),
  })
export const useCreateAssetConditionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AssetConditionRequest) => assetConditionApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetConditionKeys.all }),
  })
}
export const useUpdateAssetConditionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssetConditionRequest }) =>
      assetConditionApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetConditionKeys.all }),
  })
}
export const useToggleAssetConditionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (r: AssetCondition) =>
      assetConditionApi.update(r.assetConditionID, {
        code: r.code,
        name: r.name,
        description: r.description,
        sortOrder: r.sortOrder,
        isActive: !r.isActive,
        colorCode: r.colorCode,
        isUsable: r.isUsable,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetConditionKeys.all }),
  })
}
export const useDeleteAssetConditionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => assetConditionApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetConditionKeys.all }),
  })
}

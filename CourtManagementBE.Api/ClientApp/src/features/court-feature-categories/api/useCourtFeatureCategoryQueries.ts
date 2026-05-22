import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtFeatureCategoryApi } from './courtFeatureCategoryApi'
import type { PaginationQuery } from '@/types/api'
import type { CourtFeatureCategory, CourtFeatureCategoryRequest } from '../model/types'
export const courtFeatureCategoryKeys = {
  all: ['courtFeatureCategories'] as const,
  list: (p?: PaginationQuery) => [...courtFeatureCategoryKeys.all, 'list', p] as const,
}
export const useCourtFeatureCategoriesQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: courtFeatureCategoryKeys.list(params),
    queryFn: () => courtFeatureCategoryApi.getAll(params),
  })
export const useCreateCourtFeatureCategoryMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CourtFeatureCategoryRequest) =>
      courtFeatureCategoryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureCategoryKeys.all }),
  })
}
export const useUpdateCourtFeatureCategoryMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourtFeatureCategoryRequest }) =>
      courtFeatureCategoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureCategoryKeys.all }),
  })
}
export const useToggleCourtFeatureCategoryMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (r: CourtFeatureCategory) =>
      courtFeatureCategoryApi.update(r.courtFeatureCategoryID, {
        code: r.code,
        name: r.name,
        description: r.description,
        sortOrder: r.sortOrder,
        isActive: !r.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureCategoryKeys.all }),
  })
}
export const useDeleteCourtFeatureCategoryMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courtFeatureCategoryApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureCategoryKeys.all }),
  })
}

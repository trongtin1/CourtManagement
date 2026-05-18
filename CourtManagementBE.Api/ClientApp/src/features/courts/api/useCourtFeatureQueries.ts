import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtFeatureApi } from '@/features/courts/api/courtFeatureApi'
import type { PaginationQuery } from '@/types/api'
import type {
  CourtFeature,
  CreateCourtFeatureRequest,
  UpdateCourtFeatureRequest,
} from '../model/types'

export const courtFeatureKeys = {
  all: ['courtFeatures'] as const,
  list: (params?: PaginationQuery) => [...courtFeatureKeys.all, 'list', params] as const,
  detail: (id: number) => [...courtFeatureKeys.all, 'detail', id] as const,
}

export const useCourtFeaturesQuery = (params?: PaginationQuery) => {
  return useQuery({
    queryKey: courtFeatureKeys.list(params),
    queryFn: () => courtFeatureApi.getAll(params),
  })
}

export const useCourtFeatureQuery = (id: number) => {
  return useQuery({
    queryKey: courtFeatureKeys.detail(id),
    queryFn: () => courtFeatureApi.getById(id),
    enabled: id > 0,
  })
}

export const useCreateCourtFeatureMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourtFeatureRequest) => courtFeatureApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureKeys.all }),
  })
}

export const useUpdateCourtFeatureMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourtFeatureRequest }) =>
      courtFeatureApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureKeys.all }),
  })
}

export const useToggleCourtFeatureMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (feature: CourtFeature) =>
      courtFeatureApi.update(feature.courtFeatureID, {
        featureCode: feature.featureCode,
        featureName: feature.featureName,
        courtFeatureCategoryID: feature.courtFeatureCategoryID,
        description: feature.description,
        isActive: !feature.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureKeys.all }),
  })
}

export const useDeleteCourtFeatureMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courtFeatureApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureKeys.all }),
  })
}

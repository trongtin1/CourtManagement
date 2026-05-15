import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { courtFeatureMappingApi } from '@/features/courts/api/courtFeatureMappingApi'
import type { CreateCourtFeatureMappingRequest } from '@/features/courts/model/types'

export const courtFeatureMappingKeys = {
  all: ['court-feature-mappings'] as const,
  court: (courtId: number) => [...courtFeatureMappingKeys.all, 'court', courtId] as const,
}

export const useCourtFeatureMappingsByCourtQuery = (courtId: number, enabled = true) =>
  useQuery({
    queryKey: courtFeatureMappingKeys.court(courtId),
    queryFn: () => courtFeatureMappingApi.getByCourt(courtId),
    enabled: enabled && courtId > 0,
  })

export const useCreateCourtFeatureMappingMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCourtFeatureMappingRequest) => courtFeatureMappingApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureMappingKeys.all }),
  })
}

export const useDeleteCourtFeatureMappingMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => courtFeatureMappingApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtFeatureMappingKeys.all }),
  })
}

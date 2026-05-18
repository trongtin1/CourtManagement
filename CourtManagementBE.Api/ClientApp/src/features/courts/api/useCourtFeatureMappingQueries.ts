import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { courtFeatureMappingApi } from '@/features/courts/api/courtFeatureMappingApi'
import type { CreateCourtFeatureMappingRequest } from '@/features/courts/model/types'

export const courtFeatureMappingKeys = {
  all: ['court-feature-mappings'] as const,
  court: (courtId: number) => [...courtFeatureMappingKeys.all, 'court', courtId] as const,
}

export const useCourtFeatureMappingsByCourtQuery = (courtId: number, enabled = true) => {
  return useQuery({
    queryKey: courtFeatureMappingKeys.court(courtId),
    queryFn: () => courtFeatureMappingApi.getByCourt(courtId),
    enabled: enabled && courtId > 0,
  })
}

export const useCreateCourtFeatureMappingMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: { courtId: number, req: CreateCourtFeatureMappingRequest }) => courtFeatureMappingApi.create(data.courtId, data.req),
    onSuccess: (_, data) => qc.invalidateQueries({ queryKey: courtFeatureMappingKeys.court(data.courtId) }),
  })
}

export const useDeleteCourtFeatureMappingMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: { courtId: number, featureId: number }) => courtFeatureMappingApi.delete(data.courtId, data.featureId),
    onSuccess: (_, data) => qc.invalidateQueries({ queryKey: courtFeatureMappingKeys.court(data.courtId) }),
    })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { courtAreaMappingApi } from '@/features/courts/api/courtAreaMappingApi'
import type {
  CreateCourtAreaMappingRequest,
  UpdateCourtAreaMappingRequest,
} from '@/features/courts/model/types'

export const courtAreaMappingKeys = {
  all: ['court-area-mappings'] as const,
  area: (areaId: number) => [...courtAreaMappingKeys.all, 'area', areaId] as const,
  court: (courtId: number) => [...courtAreaMappingKeys.all, 'court', courtId] as const,
}

export const useCourtAreaMappingsByAreaQuery = (areaId: number, enabled = true) =>
  useQuery({
    queryKey: courtAreaMappingKeys.area(areaId),
    queryFn: () => courtAreaMappingApi.getByArea(areaId),
    enabled: enabled && areaId > 0,
  })

export const useCreateCourtAreaMappingMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCourtAreaMappingRequest) => courtAreaMappingApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtAreaMappingKeys.all }),
  })
}

export const useUpdateCourtAreaMappingMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourtAreaMappingRequest }) =>
      courtAreaMappingApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtAreaMappingKeys.all }),
  })
}

export const useDeleteCourtAreaMappingMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => courtAreaMappingApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtAreaMappingKeys.all }),
  })
}

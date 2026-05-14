import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { facilityApi } from '@/features/facilities/api/facilityApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateFacilityRequest, UpdateFacilityRequest } from '../model/types'

export const facilityKeys = {
  all: ['facilities'] as const,
  list: (params?: PaginationQuery) => [...facilityKeys.all, 'list', params] as const,
  detail: (id: number) => [...facilityKeys.all, 'detail', id] as const,
}

export const useFacilitiesQuery = (params?: PaginationQuery, enabled = true) =>
  useQuery({
    queryKey: facilityKeys.list(params),
    queryFn: () => facilityApi.getAll(params),
    enabled,
  })

export const useFacilityQuery = (id: number) =>
  useQuery({ queryKey: facilityKeys.detail(id), queryFn: () => facilityApi.getById(id), enabled: id > 0 })

export const useCreateFacilityMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFacilityRequest) => facilityApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  })
}

export const useUpdateFacilityMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFacilityRequest }) => facilityApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  })
}

export const useToggleFacilityMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => facilityApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  })
}

export const useDeleteFacilityMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => facilityApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: facilityKeys.all }),
  })
}

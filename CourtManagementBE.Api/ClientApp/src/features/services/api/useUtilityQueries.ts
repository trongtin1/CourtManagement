import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { utilityApi } from '@/features/services/api/utilityApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateUtilityRequest, UpdateUtilityRequest, Utility } from '../model/types'

export const utilityKeys = {
  all: ['utilities'] as const,
  list: (params?: PaginationQuery) => [...utilityKeys.all, 'list', params] as const,
  detail: (id: number) => [...utilityKeys.all, 'detail', id] as const,
}

export const useUtilitiesQuery = (params?: PaginationQuery) => {
  return useQuery({
    queryKey: utilityKeys.list(params),
    queryFn: () => utilityApi.getAll(params),
  })
}

export const useUtilityQuery = (id: number) => {
  return useQuery({
    queryKey: utilityKeys.detail(id),
    queryFn: () => utilityApi.getById(id),
    enabled: id > 0,
  })
}

export const useCreateUtilityMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUtilityRequest) => utilityApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: utilityKeys.all }),
  })
}

export const useUpdateUtilityMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUtilityRequest }) =>
      utilityApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: utilityKeys.all }),
  })
}

export const useToggleUtilityMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (record: Utility) =>
      utilityApi.update(record.utilityID, {
        utilityCode: record.utilityCode,
        utilityName: record.utilityName,
        description: record.description,
        icon: record.icon,
        isActive: !record.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: utilityKeys.all }),
  })
}

export const useDeleteUtilityMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => utilityApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: utilityKeys.all }),
  })
}

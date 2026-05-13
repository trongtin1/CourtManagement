import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { areaApi } from '@/features/areas/api/areaApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateAreaRequest, UpdateAreaRequest } from '../model/types'

export const areaKeys = {
  all: ['areas'] as const,
  list: (params?: PaginationQuery) => [...areaKeys.all, 'list', params] as const,
  detail: (id: number) => [...areaKeys.all, 'detail', id] as const,
}

export const useAreasQuery = (params: PaginationQuery = { page: 1, pageSize: 1000 }) =>
  useQuery({ queryKey: areaKeys.list(params), queryFn: () => areaApi.getAll(params) })

export const useAreaQuery = (id: number) =>
  useQuery({ queryKey: areaKeys.detail(id), queryFn: () => areaApi.getById(id), enabled: id > 0 })

export const useCreateAreaMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAreaRequest) => areaApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: areaKeys.all }),
  })
}

export const useUpdateAreaMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAreaRequest }) => areaApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: areaKeys.all }),
  })
}

export const useDeleteAreaMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => areaApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: areaKeys.all }),
  })
}

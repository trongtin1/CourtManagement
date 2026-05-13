import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtApi } from '@/features/courts/api/courtApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateCourtRequest, UpdateCourtRequest } from '../model/types'

export const courtKeys = {
  all: ['courts'] as const,
  list: (params?: PaginationQuery) => [...courtKeys.all, 'list', params] as const,
  detail: (id: number) => [...courtKeys.all, 'detail', id] as const,
}

export const useCourtsQuery = (params?: PaginationQuery) =>
  useQuery({ queryKey: courtKeys.list(params), queryFn: () => courtApi.getAll(params) })

export const useCourtQuery = (id: number) =>
  useQuery({ queryKey: courtKeys.detail(id), queryFn: () => courtApi.getById(id), enabled: id > 0 })

export const useCreateCourtMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourtRequest) => courtApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtKeys.all }),
  })
}

export const useUpdateCourtMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourtRequest }) => courtApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtKeys.all }),
  })
}

export const useToggleCourtMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courtApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtKeys.all }),
  })
}

export const useDeleteCourtMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courtApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtKeys.all }),
  })
}

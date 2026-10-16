import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { comboApi } from '@/features/combos/api/comboApi'
import type { PaginationQuery } from '@/types/api'
import type { ComboRequest } from '../model/types'

export const comboKeys = {
  all: ['combos'] as const,
  list: (params?: PaginationQuery) => [...comboKeys.all, 'list', params] as const,
  detail: (id: number) => [...comboKeys.all, 'detail', id] as const,
}

export const useCombosQuery = (params?: PaginationQuery) => {
  return useQuery({
    queryKey: comboKeys.list(params),
    queryFn: () => comboApi.getAll(params),
  })
}

export const useComboQuery = (id: number) => {
  return useQuery({
    queryKey: comboKeys.detail(id),
    queryFn: () => comboApi.getById(id),
    enabled: id > 0,
  })
}

export const useCreateComboMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ComboRequest) => comboApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: comboKeys.all }),
  })
}

export const useUpdateComboMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ComboRequest }) =>
      comboApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: comboKeys.all }),
  })
}

export const useToggleComboMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => comboApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: comboKeys.all }),
  })
}

export const useDeleteComboMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => comboApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: comboKeys.all }),
  })
}

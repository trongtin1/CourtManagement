import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancellationReasonApi } from './cancellationReasonApi'
import type { PaginationQuery } from '@/types/api'
import type { CancellationReason, CancellationReasonRequest } from '../model/types'
export const cancellationReasonKeys = {
  all: ['cancellationReasons'] as const,
  list: (p?: PaginationQuery) => [...cancellationReasonKeys.all, 'list', p] as const,
}
export const useCancellationReasonsQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: cancellationReasonKeys.list(params),
    queryFn: () => cancellationReasonApi.getAll(params),
  })
export const useCreateCancellationReasonMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CancellationReasonRequest) => cancellationReasonApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: cancellationReasonKeys.all }),
  })
}
export const useUpdateCancellationReasonMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancellationReasonRequest }) =>
      cancellationReasonApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: cancellationReasonKeys.all }),
  })
}
export const useToggleCancellationReasonMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (r: CancellationReason) =>
      cancellationReasonApi.update(r.cancellationReasonID, {
        code: r.code,
        name: r.name,
        description: r.description,
        sortOrder: r.sortOrder,
        isActive: !r.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: cancellationReasonKeys.all }),
  })
}
export const useDeleteCancellationReasonMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancellationReasonApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cancellationReasonKeys.all }),
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { refundReasonApi } from './refundReasonApi'
import type { PaginationQuery } from '@/types/api'
import type { RefundReason, RefundReasonRequest } from '../model/types'
export const refundReasonKeys = {
  all: ['refundReasons'] as const,
  list: (p?: PaginationQuery) => [...refundReasonKeys.all, 'list', p] as const,
}
export const useRefundReasonsQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: refundReasonKeys.list(params),
    queryFn: () => refundReasonApi.getAll(params),
  })
export const useCreateRefundReasonMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RefundReasonRequest) => refundReasonApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: refundReasonKeys.all }),
  })
}
export const useUpdateRefundReasonMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RefundReasonRequest }) =>
      refundReasonApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: refundReasonKeys.all }),
  })
}
export const useToggleRefundReasonMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (r: RefundReason) =>
      refundReasonApi.update(r.refundReasonID, {
        code: r.code,
        name: r.name,
        description: r.description,
        sortOrder: r.sortOrder,
        isActive: !r.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: refundReasonKeys.all }),
  })
}
export const useDeleteRefundReasonMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => refundReasonApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: refundReasonKeys.all }),
  })
}

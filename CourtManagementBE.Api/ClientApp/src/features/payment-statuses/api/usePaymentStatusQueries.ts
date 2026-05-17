import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentStatusApi } from './paymentStatusApi'
import type { PaginationQuery } from '@/types/api'
import type { PaymentStatus, CreatePaymentStatusRequest, UpdatePaymentStatusRequest } from '../model/types'

export const paymentStatusKeys = {
  all: ['paymentStatuses'] as const,
  list: (params?: PaginationQuery) => [...paymentStatusKeys.all, 'list', params] as const,
  detail: (id: number) => [...paymentStatusKeys.all, 'detail', id] as const,
}

export const usePaymentStatusesQuery = (params?: PaginationQuery) =>
  useQuery({ queryKey: paymentStatusKeys.list(params), queryFn: () => paymentStatusApi.getAll(params) })

export const useCreatePaymentStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePaymentStatusRequest) => paymentStatusApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentStatusKeys.all }),
  })
}

export const useUpdatePaymentStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePaymentStatusRequest }) => paymentStatusApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentStatusKeys.all }),
  })
}

export const useTogglePaymentStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (record: PaymentStatus) =>
      paymentStatusApi.update(record.paymentStatusID, {
        code: record.code, name: record.name, description: record.description,
        sortOrder: record.sortOrder, isActive: !record.isActive,
        colorCode: record.colorCode, isFinal: record.isFinal,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentStatusKeys.all }),
  })
}

export const useDeletePaymentStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => paymentStatusApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentStatusKeys.all }),
  })
}

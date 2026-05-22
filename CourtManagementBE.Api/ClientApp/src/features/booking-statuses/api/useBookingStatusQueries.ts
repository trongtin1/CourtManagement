import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingStatusApi } from './bookingStatusApi'
import type { PaginationQuery } from '@/types/api'
import type { BookingStatus, BookingStatusRequest } from '../model/types'

export const bookingStatusKeys = {
  all: ['bookingStatuses'] as const,
  list: (params?: PaginationQuery) => [...bookingStatusKeys.all, 'list', params] as const,
  detail: (id: number) => [...bookingStatusKeys.all, 'detail', id] as const,
}

export const useBookingStatusesQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: bookingStatusKeys.list(params),
    queryFn: () => bookingStatusApi.getAll(params),
  })

export const useCreateBookingStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookingStatusRequest) => bookingStatusApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingStatusKeys.all }),
  })
}

export const useUpdateBookingStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingStatusRequest }) =>
      bookingStatusApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingStatusKeys.all }),
  })
}

export const useToggleBookingStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (record: BookingStatus) =>
      bookingStatusApi.update(record.bookingStatusID, {
        code: record.code,
        name: record.name,
        description: record.description,
        sortOrder: record.sortOrder,
        isActive: !record.isActive,
        colorCode: record.colorCode,
        canCancel: record.canCancel,
        isFinal: record.isFinal,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingStatusKeys.all }),
  })
}

export const useDeleteBookingStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingStatusApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingStatusKeys.all }),
  })
}

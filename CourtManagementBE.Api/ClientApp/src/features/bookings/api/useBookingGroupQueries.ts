import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingGroupApi } from './bookingGroupApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateBookingGroupRequest } from '../model/types'

export const bookingGroupKeys = {
  all: ['bookingGroups'] as const,
  list: (params?: PaginationQuery) => [...bookingGroupKeys.all, 'list', params] as const,
  detail: (id: number) => [...bookingGroupKeys.all, 'detail', id] as const,
  byCustomer: (id: number) => [...bookingGroupKeys.all, 'customer', id] as const,
}

export const useBookingGroupsQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: bookingGroupKeys.list(params),
    queryFn: () => bookingGroupApi.getAll(params),
  })

export const useBookingGroupQuery = (id: number) =>
  useQuery({
    queryKey: bookingGroupKeys.detail(id),
    queryFn: () => bookingGroupApi.getById(id),
    enabled: id > 0,
  })

export const useBookingGroupsByCustomerQuery = (customerId: number) =>
  useQuery({
    queryKey: bookingGroupKeys.byCustomer(customerId),
    queryFn: () => bookingGroupApi.getByCustomer(customerId),
    enabled: customerId > 0,
  })

export const useCreateBookingGroupMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBookingGroupRequest) => bookingGroupApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingGroupKeys.all }),
  })
}

export const useUpdateBookingGroupMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateBookingGroupRequest }) =>
      bookingGroupApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingGroupKeys.all }),
  })
}

export const useCancelBookingGroupMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      bookingGroupApi.cancel(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingGroupKeys.all }),
  })
}

export const useDeleteBookingGroupMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingGroupApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingGroupKeys.all }),
  })
}

export const usePayBookingGroupDepositMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { amount: number; note?: string } }) =>
      bookingGroupApi.payDeposit(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingGroupKeys.all })
      qc.invalidateQueries({ queryKey: bookingGroupKeys.detail(id) })
    },
  })
}

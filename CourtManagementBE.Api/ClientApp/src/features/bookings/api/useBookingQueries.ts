import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingApi } from '@/features/bookings/api/bookingApi'
import { bookingSlotApi } from '@/features/bookings/api/bookingSlotApi'
import { bookingServiceApi } from '@/features/bookings/api/bookingServiceApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateBookingRequest, UpdateBookingRequest, CancelBookingRequest } from '../model/types'

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (params?: PaginationQuery) => [...bookingKeys.all, 'list', params] as const,
  byDate: (date: string) => [...bookingKeys.all, 'date', date] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  bookedSlots: (courtId: number, date: string) => [...bookingKeys.all, 'bookedSlots', courtId, date] as const,
  slotsByBooking: (bookingId: string) => [...bookingKeys.all, 'slots', bookingId] as const,
  servicesByBooking: (bookingId: string) => [...bookingKeys.all, 'services', bookingId] as const,
  slotsByDate: (date: string) => [...bookingKeys.all, 'slotsByDate', date] as const,
}

export const useBookingsQuery = (params?: PaginationQuery) => {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingApi.getAll(params)
  })
}

export const useBookingsByDateQuery = (date: string) => {
  return useQuery({
    queryKey: bookingKeys.byDate(date),
    queryFn: () => bookingApi.getByDate(date),
    enabled: !!date,
  })
}

export const useBookingSlotsByDateQuery = (date: string) => {
  return useQuery({
    queryKey: bookingKeys.slotsByDate(date),
    queryFn: () => bookingSlotApi.getByDate(date),
    enabled: !!date,
  })
}

export const useCourtBookedSlotsQuery = (courtId: number | null, date: string) => {
  return useQuery({
    queryKey: bookingKeys.bookedSlots(courtId ?? 0, date),
    queryFn: () => bookingSlotApi.getByCourtAndDate(courtId!, date),
    enabled: !!courtId && !!date,
  })
}

export const useBookingSlotsQuery = (bookingId: string | null) => {
  return useQuery({
    queryKey: bookingKeys.slotsByBooking(bookingId ?? ''),
    queryFn: () => bookingSlotApi.getByBooking(bookingId!),
    enabled: !!bookingId,
  })
}

export const useBookingServicesQuery = (bookingId: string | null) => {
  return useQuery({
    queryKey: bookingKeys.servicesByBooking(bookingId ?? ''),
    queryFn: () => bookingServiceApi.getByBooking(bookingId!),
    enabled: !!bookingId,
  })
}

export const useBookingQuery = (id: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingApi.getById(id),
    enabled: !!id
  })
}

export const useCreateBookingMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}

export const useUpdateBookingMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingRequest }) => bookingApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}

export const useCancelBookingMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelBookingRequest }) => bookingApi.cancel(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}

export const useDeleteBookingMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  })
}


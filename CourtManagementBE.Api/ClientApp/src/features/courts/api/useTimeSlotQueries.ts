import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { timeSlotApi } from '@/features/courts/api/timeSlotApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateTimeSlotRequest, TimeSlot, UpdateTimeSlotRequest } from '../model/types'

export const timeSlotKeys = {
  all: ['timeSlots'] as const,
  list: (params?: PaginationQuery) => [...timeSlotKeys.all, 'list', params] as const,
  detail: (id: number) => [...timeSlotKeys.all, 'detail', id] as const,
}

export const useTimeSlotsQuery = (params?: PaginationQuery) =>
  useQuery({ queryKey: timeSlotKeys.list(params), queryFn: () => timeSlotApi.getAll(params) })

export const useTimeSlotQuery = (id: number) =>
  useQuery({ queryKey: timeSlotKeys.detail(id), queryFn: () => timeSlotApi.getById(id), enabled: id > 0 })

export const useCreateTimeSlotMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTimeSlotRequest) => timeSlotApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timeSlotKeys.all }),
  })
}

export const useUpdateTimeSlotMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTimeSlotRequest }) => timeSlotApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: timeSlotKeys.all }),
  })
}

export const useToggleTimeSlotMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (record: TimeSlot) =>
      timeSlotApi.update(record.timeSlotID, {
        slotName: record.slotName,
        startTime: record.startTime,
        endTime: record.endTime,
        isActive: !record.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: timeSlotKeys.all }),
  })
}

export const useDeleteTimeSlotMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => timeSlotApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: timeSlotKeys.all }),
  })
}

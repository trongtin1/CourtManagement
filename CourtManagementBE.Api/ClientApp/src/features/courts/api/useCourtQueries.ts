import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtApi } from '@/features/courts/api/courtApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateCourtRequest, UpdateCourtRequest } from '../model/types'

export const courtKeys = {
  all: ['courts'] as const,
  list: (params?: PaginationQuery) => [...courtKeys.all, 'list', params] as const,
  detail: (id: number) => [...courtKeys.all, 'detail', id] as const,
  slotsAvailability: (id: number, date: string) =>
    [...courtKeys.all, 'slotsAvailability', id, date] as const,
  timelineAvailability: (facilityId: number, date: string) =>
    [...courtKeys.all, 'timelineAvailability', facilityId, date] as const,
}

export const useCourtsQuery = (params?: PaginationQuery, enabled = true) => {
  return useQuery({
    queryKey: courtKeys.list(params),
    queryFn: () => courtApi.getAll(params),
    enabled,
  })
}

export const useCourtQuery = (id: number) => {
  return useQuery({ 
    queryKey: courtKeys.detail(id), 
    queryFn: () => courtApi.getById(id), 
    enabled: id > 0 });
}

export const useCourtSlotsAvailabilityQuery = (id: number | null, date: string) => {
  return useQuery({
    queryKey: courtKeys.slotsAvailability(id ?? 0, date),
    queryFn: () => courtApi.getSlotsAvailability(id!, date),
    enabled: !!id && !!date,
  })
}

export const useCourtTimelineAvailabilityQuery = (facilityId: number | null, date: string) => {
  return useQuery({
    queryKey: courtKeys.timelineAvailability(facilityId ?? 0, date),
    queryFn: () => courtApi.getTimelineAvailability(facilityId!, date),
    enabled: !!facilityId && !!date,
  })
}

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

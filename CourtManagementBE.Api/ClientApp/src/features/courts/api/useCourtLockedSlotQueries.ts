import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtLockedSlotApi } from './courtLockedSlotApi'
import type { PaginationQuery } from '@/types/api'
import type {
  CreateCourtLockedSlotRequest,
  UpdateCourtLockedSlotRequest,
} from '../model/types'

export const courtLockedSlotKeys = {
  all: ['courtLockedSlots'] as const,
  list: (params?: PaginationQuery) => [...courtLockedSlotKeys.all, 'list', params] as const,
  court: (courtId: number, targetDate?: string | null) =>
    [...courtLockedSlotKeys.all, 'court', courtId, targetDate ?? null] as const,
  availability: (courtId: number, targetDate: string) =>
    [...courtLockedSlotKeys.all, 'availability', courtId, targetDate] as const,
}

export const useCourtLockedSlotsQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: courtLockedSlotKeys.list(params),
    queryFn: () => courtLockedSlotApi.getAll(params),
  })

export const useCourtLockedSlotsByCourtQuery = (
  courtId: number,
  targetDate?: string | null,
) =>
  useQuery({
    queryKey: courtLockedSlotKeys.court(courtId, targetDate),
    queryFn: () => courtLockedSlotApi.getByCourt(courtId, targetDate),
    enabled: courtId > 0,
  })

export const useCourtAvailabilityBlocksQuery = (courtId: number, targetDate: string) =>
  useQuery({
    queryKey: courtLockedSlotKeys.availability(courtId, targetDate),
    queryFn: () => courtLockedSlotApi.getAvailabilityBlocks(courtId, targetDate),
    enabled: courtId > 0 && !!targetDate,
  })

export const useCreateCourtLockedSlotMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourtLockedSlotRequest) => courtLockedSlotApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtLockedSlotKeys.all }),
  })
}

export const useUpdateCourtLockedSlotMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourtLockedSlotRequest }) =>
      courtLockedSlotApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtLockedSlotKeys.all }),
  })
}

export const useDeleteCourtLockedSlotMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courtLockedSlotApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtLockedSlotKeys.all }),
  })
}
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { courtPriceApi } from './courtPriceApi'
import type {
  CreateCourtPriceRequest,
  UpdateCourtPriceRequest,
} from '@/features/courts/model/types'

export const courtPriceKeys = {
  all: ['courtPrices'] as const,
  court: (courtId: number) => [...courtPriceKeys.all, 'court', courtId] as const,
  courtWithDate: (courtId: number, targetDate: string) =>
    [...courtPriceKeys.court(courtId), targetDate] as const,
}

export const useCourtPricesByCourtQuery = (courtId: number, targetDate: string) =>
  useQuery({
    enabled: courtId > 0 && !!targetDate,
    queryKey: courtPriceKeys.courtWithDate(courtId, targetDate),
    queryFn: () => courtPriceApi.getByCourt(courtId, targetDate),
    placeholderData: keepPreviousData,
  })

export const useCreateCourtPriceMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCourtPriceRequest) => courtPriceApi.create(data),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: courtPriceKeys.court(variables.courtID),
      }),
  })
}

export const useUpdateCourtPriceMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourtPriceRequest }) =>
      courtPriceApi.update(id, data),
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: courtPriceKeys.court(data.courtID) }),
  })
}

export const useDeleteCourtPriceMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courtId, id }: { courtId: number; id: number }) =>
      courtPriceApi.delete(id).then(() => courtId),
    onSuccess: (courtId) =>
      queryClient.invalidateQueries({ queryKey: courtPriceKeys.court(courtId) }),
  })
}

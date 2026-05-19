import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtPriceApi } from './courtPriceApi'
import type {
  CreateCourtPriceRequest,
  UpdateCourtPriceRequest,
} from '@/features/courts/model/types'

export const courtPriceKeys = {
  all: ['courtPrices'] as const,
  court: (courtId: number) => [...courtPriceKeys.all, 'court', courtId] as const,
}

export const useCourtPricesByCourtQuery = (courtId: number) =>
  useQuery({
    enabled: courtId > 0,
    queryKey: courtPriceKeys.court(courtId),
    queryFn: () => courtPriceApi.getByCourt(courtId),
  })

export const useCreateCourtPriceMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCourtPriceRequest) => courtPriceApi.create(data),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: courtPriceKeys.court(variables.courtID) }),
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

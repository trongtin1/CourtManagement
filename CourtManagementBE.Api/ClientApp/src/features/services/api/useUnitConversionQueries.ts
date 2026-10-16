import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { unitConversionApi } from './unitConversionApi'
import type { UnitConversionRequest } from '../model/types'

export const unitConversionKeys = {
  all: ['unitConversions'] as const,
  byService: (serviceId: number) =>
    [...unitConversionKeys.all, 'service', serviceId] as const,
}

export const useUnitConversionsQuery = (serviceId: number) => {
  return useQuery({
    queryKey: unitConversionKeys.byService(serviceId),
    queryFn: () => unitConversionApi.getByService(serviceId),
    enabled: serviceId > 0,
  })
}

export const useCreateUnitConversionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UnitConversionRequest) => unitConversionApi.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: unitConversionKeys.byService(variables.serviceID),
      })
    },
  })
}

export const useUpdateUnitConversionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UnitConversionRequest }) =>
      unitConversionApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: unitConversionKeys.byService(variables.data.serviceID),
      })
    },
  })
}

export const useDeleteUnitConversionMutation = (serviceId: number) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => unitConversionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: unitConversionKeys.byService(serviceId) })
    },
  })
}

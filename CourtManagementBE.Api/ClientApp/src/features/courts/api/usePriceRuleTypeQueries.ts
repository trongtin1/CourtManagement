import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { priceRuleTypeApi } from './priceRuleTypeApi'
import type { PaginationQuery } from '@/types/api'
import type {
  CreatePriceRuleTypeRequest,
  PriceRuleType,
  UpdatePriceRuleTypeRequest,
} from '../model/types'

export const priceRuleTypeKeys = {
  all: ['priceRuleTypes'] as const,
  list: (params?: PaginationQuery) => [...priceRuleTypeKeys.all, 'list', params] as const,
  detail: (id: number) => [...priceRuleTypeKeys.all, 'detail', id] as const,
}

export const usePriceRuleTypesQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: priceRuleTypeKeys.list(params),
    queryFn: () => priceRuleTypeApi.getAll(params),
  })

export const usePriceRuleTypeQuery = (id?: number) =>
  useQuery({
    enabled: !!id,
    queryKey: priceRuleTypeKeys.detail(id ?? 0),
    queryFn: () => priceRuleTypeApi.getById(id!),
  })

export const useCreatePriceRuleTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePriceRuleTypeRequest) => priceRuleTypeApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: priceRuleTypeKeys.all }),
  })
}

export const useUpdatePriceRuleTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePriceRuleTypeRequest }) =>
      priceRuleTypeApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: priceRuleTypeKeys.all }),
  })
}

export const useTogglePriceRuleTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (record: PriceRuleType) =>
      priceRuleTypeApi.update(record.priceRuleTypeID, {
        code: record.code,
        name: record.name,
        description: record.description,
        sortOrder: record.sortOrder,
        isActive: !record.isActive,
        colorCode: record.colorCode,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: priceRuleTypeKeys.all }),
  })
}

export const useDeletePriceRuleTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => priceRuleTypeApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: priceRuleTypeKeys.all }),
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtDefaultPriceRuleApi } from './courtDefaultPriceRuleApi'
import type { PaginationQuery } from '@/types/api'
import type {
  CourtDefaultPriceRule,
  CreateCourtDefaultPriceRuleRequest,
  UpdateCourtDefaultPriceRuleRequest,
} from '../model/types'

export const courtDefaultPriceRuleKeys = {
  all: ['courtDefaultPriceRules'] as const,
  list: (params?: PaginationQuery) =>
    [...courtDefaultPriceRuleKeys.all, 'list', params] as const,
  day: (dayOfWeek: number) =>
    [...courtDefaultPriceRuleKeys.all, 'day', dayOfWeek] as const,
}

export const useCourtDefaultPriceRulesQuery = (
  params?: PaginationQuery,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: courtDefaultPriceRuleKeys.list(params),
    queryFn: () => courtDefaultPriceRuleApi.getAll(params),
    ...options,
  })

export const useCourtDefaultPriceRulesByDayQuery = (dayOfWeek: number) =>
  useQuery({
    queryKey: courtDefaultPriceRuleKeys.day(dayOfWeek),
    queryFn: () => courtDefaultPriceRuleApi.getByDay(dayOfWeek),
  })

export const useCreateCourtDefaultPriceRuleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourtDefaultPriceRuleRequest) =>
      courtDefaultPriceRuleApi.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: courtDefaultPriceRuleKeys.all }),
  })
}

export const useUpdateCourtDefaultPriceRuleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateCourtDefaultPriceRuleRequest
    }) => courtDefaultPriceRuleApi.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: courtDefaultPriceRuleKeys.all }),
  })
}

export const useToggleCourtDefaultPriceRuleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (record: CourtDefaultPriceRule) =>
      courtDefaultPriceRuleApi.update(record.courtDefaultPriceRuleID, {
        priceRuleTypeID: record.priceRuleTypeID ?? null,
        dayOfWeek: record.dayOfWeek,
        startTime: record.startTime,
        endTime: record.endTime,
        price: record.price,
        isActive: !record.isActive,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: courtDefaultPriceRuleKeys.all }),
  })
}

export const useDeleteCourtDefaultPriceRuleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courtDefaultPriceRuleApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: courtDefaultPriceRuleKeys.all }),
  })
}

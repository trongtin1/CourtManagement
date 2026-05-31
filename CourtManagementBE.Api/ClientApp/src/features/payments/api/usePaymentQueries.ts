import { useQuery } from '@tanstack/react-query'
import { paymentApi } from '@/features/payments/api/paymentApi'
import type { PaginationQuery } from '@/types/api'

export const paymentKeys = {
  all: ['payments'] as const,
  list: (params?: PaginationQuery) => [...paymentKeys.all, 'list', params] as const,
  detail: (id: number) => [...paymentKeys.all, 'detail', id] as const,
}

export const usePaymentsQuery = (params?: PaginationQuery) => { 
  return useQuery({ 
    queryKey: paymentKeys.list(params), 
    queryFn: () => paymentApi.getAll(params) 
  })
}

export const usePaymentQuery = (id: number) => {
  return useQuery({ 
    queryKey: paymentKeys.detail(id), 
    queryFn: () => paymentApi.getById(id), 
    enabled: id > 0 
  })
}

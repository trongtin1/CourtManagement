import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentMethodApi } from './paymentMethodApi'
import type { PaginationQuery } from '@/types/api'
import type { PaymentMethod, PaymentMethodRequest } from '../model/types'

export const paymentMethodKeys = {
  all: ['paymentMethods'] as const,
  list: (p?: PaginationQuery) => [...paymentMethodKeys.all, 'list', p] as const,
  detail: (id: number) => [...paymentMethodKeys.all, 'detail', id] as const,
}

export const usePaymentMethodsQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: paymentMethodKeys.list(params),
    queryFn: () => paymentMethodApi.getAll(params),
  })
export const useCreatePaymentMethodMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PaymentMethodRequest) => paymentMethodApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentMethodKeys.all }),
  })
}
export const useUpdatePaymentMethodMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentMethodRequest }) =>
      paymentMethodApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentMethodKeys.all }),
  })
}
export const useTogglePaymentMethodMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (r: PaymentMethod) =>
      paymentMethodApi.update(r.paymentMethodID, {
        code: r.code,
        name: r.name,
        description: r.description,
        sortOrder: r.sortOrder,
        isActive: !r.isActive,
        isOnline: r.isOnline,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentMethodKeys.all }),
  })
}
export const useDeletePaymentMethodMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => paymentMethodApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentMethodKeys.all }),
  })
}

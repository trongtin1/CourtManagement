import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customerTypeApi } from './customerTypeApi'
import type { PaginationQuery } from '@/types/api'
import type { CustomerType, CustomerTypeRequest } from '../model/types'
export const customerTypeKeys = {
  all: ['customerTypes'] as const,
  list: (p?: PaginationQuery) => [...customerTypeKeys.all, 'list', p] as const,
}
export const useCustomerTypesQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: customerTypeKeys.list(params),
    queryFn: () => customerTypeApi.getAll(params),
  })
export const useCreateCustomerTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerTypeRequest) => customerTypeApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerTypeKeys.all }),
  })
}
export const useUpdateCustomerTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerTypeRequest }) =>
      customerTypeApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerTypeKeys.all }),
  })
}
export const useToggleCustomerTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (r: CustomerType) =>
      customerTypeApi.update(r.customerTypeID, {
        code: r.code,
        name: r.name,
        description: r.description,
        sortOrder: r.sortOrder,
        isActive: !r.isActive,
        discountPercent: r.discountPercent,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerTypeKeys.all }),
  })
}
export const useDeleteCustomerTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => customerTypeApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerTypeKeys.all }),
  })
}

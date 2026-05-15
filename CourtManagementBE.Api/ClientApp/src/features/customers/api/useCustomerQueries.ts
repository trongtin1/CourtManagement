import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customerApi } from '@/features/customers/api/customerApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateCustomerRequest, UpdateCustomerRequest } from '../model/types'

export const customerKeys = {
  all: ['customers'] as const,
  list: (params?: PaginationQuery) => [...customerKeys.all, 'list', params] as const,
  detail: (id: number) => [...customerKeys.all, 'detail', id] as const,
}

export const useCustomersQuery = (params?: PaginationQuery) => {
  return useQuery({  
    queryKey: customerKeys.list(params),  
    queryFn: () => customerApi.getAll(params) 
  })
}

export const useCustomerQuery = (id: number) => {
  return useQuery({ 
    queryKey: customerKeys.detail(id), 
    queryFn: () => customerApi.getById(id), 
    enabled: id > 0 
  })
}

export const useCreateCustomerMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customerApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  })
}

export const useUpdateCustomerMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerRequest }) => customerApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  })
}

export const useDeleteCustomerMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  })
}

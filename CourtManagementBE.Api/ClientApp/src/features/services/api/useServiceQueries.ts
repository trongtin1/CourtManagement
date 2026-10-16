import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceApi } from '@/features/services/api/serviceApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateServiceRequest, UpdateServiceRequest } from '../model/types'

export const serviceKeys = {
  all: ['services'] as const,
  list: (params?: PaginationQuery) => [...serviceKeys.all, 'list', params] as const,
  detail: (id: number) => [...serviceKeys.all, 'detail', id] as const,
}

export const useServicesQuery = (params?: PaginationQuery) => {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => serviceApi.getAll(params),
  })
}

export const useServiceQuery = (id: number) => {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => serviceApi.getById(id),
    enabled: id > 0,
  })
}

export const useCreateServiceMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}

export const useUpdateServiceMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceRequest }) =>
      serviceApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}

export const useToggleServiceMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => serviceApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}

export const useDeleteServiceMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => serviceApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  })
}

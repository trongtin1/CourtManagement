import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceTypeApi } from './serviceTypeApi'
import type { PaginationQuery } from '@/types/api'
import type { ServiceType, ServiceTypeRequest } from '../model/types'
export const serviceTypeKeys = {
  all: ['serviceTypes'] as const,
  list: (p?: PaginationQuery) => [...serviceTypeKeys.all, 'list', p] as const,
}
export const useServiceTypesQuery = (params?: PaginationQuery) =>
  useQuery({
    queryKey: serviceTypeKeys.list(params),
    queryFn: () => serviceTypeApi.getAll(params),
  })
export const useCreateServiceTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ServiceTypeRequest) => serviceTypeApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceTypeKeys.all }),
  })
}
export const useUpdateServiceTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceTypeRequest }) =>
      serviceTypeApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceTypeKeys.all }),
  })
}
export const useToggleServiceTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (r: ServiceType) =>
      serviceTypeApi.update(r.serviceTypeID, {
        code: r.code,
        name: r.name,
        description: r.description,
        sortOrder: r.sortOrder,
        isActive: !r.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceTypeKeys.all }),
  })
}
export const useDeleteServiceTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => serviceTypeApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceTypeKeys.all }),
  })
}

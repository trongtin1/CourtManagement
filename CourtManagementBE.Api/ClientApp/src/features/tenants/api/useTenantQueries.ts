import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tenantApi } from '@/features/tenants/api/tenantApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateTenantRequest, UpdateTenantRequest } from '../model/types'

export const tenantKeys = {
  all: ['tenants'] as const,
  list: (params?: PaginationQuery) => [...tenantKeys.all, 'list', params] as const,
  detail: (id: number) => [...tenantKeys.all, 'detail', id] as const,
}

export const useTenantsQuery = (params?: PaginationQuery) =>
  useQuery({ queryKey: tenantKeys.list(params), queryFn: () => tenantApi.getAll(params) })

export const useTenantQuery = (id: number) =>
  useQuery({ queryKey: tenantKeys.detail(id), queryFn: () => tenantApi.getById(id), enabled: id > 0 })

export const useCreateTenantMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTenantRequest) => tenantApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  })
}

export const useUpdateTenantMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTenantRequest }) => tenantApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  })
}

export const useDeleteTenantMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tenantApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  })
}

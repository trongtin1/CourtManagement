import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtTypeApi } from '@/features/courts/api/courtTypeApi'
import type { PaginationQuery } from '@/types/api'
import type { CourtType, CreateCourtTypeRequest, UpdateCourtTypeRequest } from '../model/types'

export const courtTypeKeys = {
  all: ['courtTypes'] as const,
  list: (params?: PaginationQuery) => [...courtTypeKeys.all, 'list', params] as const,
  detail: (id: number) => [...courtTypeKeys.all, 'detail', id] as const,
}

export const useCourtTypesQuery = (params?: PaginationQuery) => {
  return useQuery({ 
    queryKey: courtTypeKeys.list(params), 
    queryFn: () => courtTypeApi.getAll(params) 
  })
}

export const useCourtTypeQuery = (id: number) => {
  return useQuery({ 
    queryKey: courtTypeKeys.detail(id), 
    queryFn: () => courtTypeApi.getById(id), 
    enabled: id > 0 
  })
}

export const useCreateCourtTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourtTypeRequest) => courtTypeApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtTypeKeys.all }),
  })
}

export const useUpdateCourtTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourtTypeRequest }) => courtTypeApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtTypeKeys.all }),
  })
}

export const useToggleCourtTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (record: CourtType) =>
      courtTypeApi.update(record.courtTypeID, {
        code: record.code,
        name: record.name,
        description: record.description,
        isActive: !record.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtTypeKeys.all }),
  })
}

export const useDeleteCourtTypeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courtTypeApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtTypeKeys.all }),
  })
}

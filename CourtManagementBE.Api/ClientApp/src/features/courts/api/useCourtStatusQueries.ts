import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { courtStatusApi } from '@/features/courts/api/courtStatusApi'
import type { PaginationQuery } from '@/types/api'
import type {
  CourtStatus,
  CreateCourtStatusRequest,
  UpdateCourtStatusRequest,
} from '../model/types'

export const courtStatusKeys = {
  all: ['courtStatuses'] as const,
  list: (params?: PaginationQuery) => [...courtStatusKeys.all, 'list', params] as const,
  detail: (id: number) => [...courtStatusKeys.all, 'detail', id] as const,
}

export const useCourtStatusesQuery = (params?: PaginationQuery) =>
  useQuery({ queryKey: courtStatusKeys.list(params), queryFn: () => courtStatusApi.getAll(params) })

export const useCourtStatusQuery = (id: number) =>
  useQuery({ queryKey: courtStatusKeys.detail(id), queryFn: () => courtStatusApi.getById(id), enabled: id > 0 })

export const useCreateCourtStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourtStatusRequest) => courtStatusApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtStatusKeys.all }),
  })
}

export const useUpdateCourtStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourtStatusRequest }) =>
      courtStatusApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtStatusKeys.all }),
  })
}

export const useToggleCourtStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (record: CourtStatus) =>
      courtStatusApi.update(record.statusID, {
        statusCode: record.statusCode,
        statusName: record.statusName,
        colorCode: record.colorCode,
        description: record.description,
        isActive: !record.isActive,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtStatusKeys.all }),
  })
}

export const useDeleteCourtStatusMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => courtStatusApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtStatusKeys.all }),
  })
}

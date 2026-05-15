import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { courtAssetApi } from '@/features/courts/api/courtAssetApi'
import type { PaginationQuery } from '@/types/api'
import type { CreateCourtAssetRequest, UpdateCourtAssetRequest } from '../model/types'

export const courtAssetKeys = {
  all: ['court-assets'] as const,
  list: (params?: PaginationQuery) => [...courtAssetKeys.all, 'list', params] as const,
  court: (courtId: number) => [...courtAssetKeys.all, 'court', courtId] as const,
  detail: (id: number) => [...courtAssetKeys.all, 'detail', id] as const,
}

export const useCourtAssetsQuery = (params?: PaginationQuery) =>
  useQuery({  
    queryKey: courtAssetKeys.list(params),
    queryFn: () => courtAssetApi.getAll(params),
  })

export const useCourtAssetsByCourtQuery = (courtId: number, enabled = true) => {    
  return useQuery({  
    queryKey: courtAssetKeys.court(courtId),
    queryFn: () => courtAssetApi.getByCourt(courtId),
    enabled: enabled && courtId > 0,
  })}

export const useCreateCourtAssetMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCourtAssetRequest) => courtAssetApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtAssetKeys.all }),
  })
}

export const useUpdateCourtAssetMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourtAssetRequest }) =>
      courtAssetApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtAssetKeys.all }),
  })
}

export const useDeleteCourtAssetMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => courtAssetApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: courtAssetKeys.all }),
  })
}

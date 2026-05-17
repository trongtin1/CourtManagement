import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { unitApi } from './unitApi'
import type { PaginationQuery } from '@/types/api'
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../model/types'
export const unitKeys = { all: ['units'] as const, list: (p?: PaginationQuery) => [...unitKeys.all, 'list', p] as const }
export const useUnitsQuery = (params?: PaginationQuery) => useQuery({ queryKey: unitKeys.list(params), queryFn: () => unitApi.getAll(params) })
export const useCreateUnitMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: CreateUnitRequest) => unitApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: unitKeys.all }) }) }
export const useUpdateUnitMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: number; data: UpdateUnitRequest }) => unitApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: unitKeys.all }) }) }
export const useToggleUnitMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (r: Unit) => unitApi.update(r.unitID, { code: r.code, name: r.name, description: r.description, sortOrder: r.sortOrder, isActive: !r.isActive, symbol: r.symbol }), onSuccess: () => qc.invalidateQueries({ queryKey: unitKeys.all }) }) }
export const useDeleteUnitMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => unitApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: unitKeys.all }) }) }

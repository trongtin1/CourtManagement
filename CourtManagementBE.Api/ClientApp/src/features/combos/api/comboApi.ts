import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { Combo, ComboRequest } from '../model/types'

export const comboApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<Combo>>('/combo', params),
  getById: (id: number) => apiGet<Combo>(`/combo/${id}`),
  create: (data: ComboRequest) => apiPost<Combo>('/combo', data),
  update: (id: number, data: ComboRequest) => apiPut<Combo>(`/combo/${id}`, data),
  toggleActive: (id: number) => apiPatch<boolean>(`/combo/${id}/toggle-active`),
  delete: (id: number) => apiDelete<boolean>(`/combo/${id}`),
}

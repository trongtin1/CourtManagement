import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { CancellationReason, CreateCancellationReasonRequest, UpdateCancellationReasonRequest } from '../model/types'
export const cancellationReasonApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<CancellationReason>>('/CancellationReason', params),
  getById: (id: number) => apiGet<CancellationReason>(`/CancellationReason/${id}`),
  create: (data: CreateCancellationReasonRequest) => apiPost<CancellationReason>('/CancellationReason', data),
  update: (id: number, data: UpdateCancellationReasonRequest) => apiPut<CancellationReason>(`/CancellationReason/${id}`, data),
  delete: (id: number) => apiDelete(`/CancellationReason/${id}`),
}

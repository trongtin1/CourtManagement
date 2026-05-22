import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { RefundReason, RefundReasonRequest } from '../model/types'
export const refundReasonApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<RefundReason>>('/RefundReason', params),
  getById: (id: number) => apiGet<RefundReason>(`/RefundReason/${id}`),
  create: (data: RefundReasonRequest) => apiPost<RefundReason>('/RefundReason', data),
  update: (id: number, data: RefundReasonRequest) =>
    apiPut<RefundReason>(`/RefundReason/${id}`, data),
  delete: (id: number) => apiDelete(`/RefundReason/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { RefundReason, CreateRefundReasonRequest, UpdateRefundReasonRequest } from '../model/types'
export const refundReasonApi = {
  getAll: (params?: PaginationQuery) => apiGet<PageList<RefundReason>>('/RefundReason', params),
  getById: (id: number) => apiGet<RefundReason>(`/RefundReason/${id}`),
  create: (data: CreateRefundReasonRequest) => apiPost<RefundReason>('/RefundReason', data),
  update: (id: number, data: UpdateRefundReasonRequest) => apiPut<RefundReason>(`/RefundReason/${id}`, data),
  delete: (id: number) => apiDelete(`/RefundReason/${id}`),
}

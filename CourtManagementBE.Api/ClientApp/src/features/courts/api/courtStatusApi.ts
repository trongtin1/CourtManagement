import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  CourtStatus,
  CreateCourtStatusRequest,
  UpdateCourtStatusRequest,
} from '../model/types'


export const courtStatusApi = {
  getAll: (params: PaginationQuery = { page: 1, pageSize: 1000 }) =>
    apiGet<PageList<CourtStatus>>('/courtstatus', params),
  getById: (id: number) => apiGet<CourtStatus>(`/courtstatus/${id}`),
  create: (data: CreateCourtStatusRequest) =>
    apiPost<CourtStatus>('/courtstatus', data),
  update: (id: number, data: UpdateCourtStatusRequest) =>
    apiPut<CourtStatus>(`/courtstatus/${id}`, data),
  delete: (id: number) => apiDelete(`/courtstatus/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type { CourtPrice, CreateCourtPriceRequest, UpdateCourtPriceRequest } from '../model/types'


export const courtPriceApi = {
  getAll: (params: PaginationQuery = { page: 1, pageSize: 1000 }) =>
    apiGet<PageList<CourtPrice>>('/courtprice', params),
  getById: (id: number) => apiGet<CourtPrice>(`/courtprice/${id}`),
  getByCourt: (courtId: number) =>
    apiGet<CourtPrice[]>(`/courtprice/court/${courtId}`),
  getByCourtAndDay: (courtId: number, dayOfWeek: number) =>
    apiGet<CourtPrice[]>(`/courtprice/court/${courtId}/day/${dayOfWeek}`),
  create: (data: CreateCourtPriceRequest) =>
    apiPost<CourtPrice>(`/courtprice`, data),
  update: (id: number, data: UpdateCourtPriceRequest) =>
    apiPut<CourtPrice>(`/courtprice/${id}`, data),
  delete: (id: number) => apiDelete(`/courtprice/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type {
  CourtPrice,
  CreateCourtPriceRequest,
  UpdateCourtPriceRequest,
} from '../model/types'

export const courtPriceApi = {
  getByCourt: (courtId: number, targetDate: string) =>
    apiGet<CourtPrice[]>(`/courtprice/court/${courtId}`, { targetDate }),
  create: (data: CreateCourtPriceRequest) => apiPost<CourtPrice>(`/courtprice`, data),
  update: (id: number, data: UpdateCourtPriceRequest) =>
    apiPut<CourtPrice>(`/courtprice/${id}`, data),
  delete: (id: number) => apiDelete(`/courtprice/${id}`),
}

import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  CourtDefaultPriceRule,
  CreateCourtDefaultPriceRuleRequest,
  UpdateCourtDefaultPriceRuleRequest,
} from '../model/types'

export const courtDefaultPriceRuleApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<CourtDefaultPriceRule>>('/courtdefaultpricerule', params),
  getByDay: (dayOfWeek: number) =>
    apiGet<CourtDefaultPriceRule[]>(`/courtdefaultpricerule/day/${dayOfWeek}`),
  create: (data: CreateCourtDefaultPriceRuleRequest) =>
    apiPost<CourtDefaultPriceRule>('/courtdefaultpricerule', data),
  update: (id: number, data: UpdateCourtDefaultPriceRuleRequest) =>
    apiPut<CourtDefaultPriceRule>(`/courtdefaultpricerule/${id}`, data),
  delete: (id: number) => apiDelete(`/courtdefaultpricerule/${id}`),
}

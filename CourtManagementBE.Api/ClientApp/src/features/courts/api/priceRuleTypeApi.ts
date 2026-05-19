import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { PageList, PaginationQuery } from '@/types/api'
import type {
  CreatePriceRuleTypeRequest,
  PriceRuleType,
  UpdatePriceRuleTypeRequest,
} from '../model/types'

export const priceRuleTypeApi = {
  getAll: (params?: PaginationQuery) =>
    apiGet<PageList<PriceRuleType>>('/priceruletype', params),
  getById: (id: number) => apiGet<PriceRuleType>(`/priceruletype/${id}`),
  create: (data: CreatePriceRuleTypeRequest) =>
    apiPost<PriceRuleType>('/priceruletype', data),
  update: (id: number, data: UpdatePriceRuleTypeRequest) =>
    apiPut<PriceRuleType>(`/priceruletype/${id}`, data),
  delete: (id: number) => apiDelete(`/priceruletype/${id}`),
}

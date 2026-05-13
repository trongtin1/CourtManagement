import { apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type {
  CreateServicePriceRequest,
  ServicePrice,
  UpdateServicePriceRequest,
} from '../model/types'



export const servicePriceApi = {
  getByService: (serviceId: number) =>
    apiGet<ServicePrice[]>(`/serviceprice/service/${serviceId}`),
  getCurrentByService: (serviceId: number) =>
    apiGet<ServicePrice>(`/serviceprice/service/${serviceId}/current`),
  create: (data: CreateServicePriceRequest) =>
    apiPost<ServicePrice>('/serviceprice', data),
  update: (id: number, data: UpdateServicePriceRequest) =>
    apiPut<ServicePrice>(`/serviceprice/${id}`, data),
}

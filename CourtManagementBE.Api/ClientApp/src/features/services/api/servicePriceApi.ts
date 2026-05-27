import { apiPost, apiPut } from '@/services/api/apiClient'
import type {
  CreateServicePriceRequest,
  ServicePrice,
  UpdateServicePriceRequest,
} from '../model/types'



export const servicePriceApi = {
  create: (data: CreateServicePriceRequest) =>
    apiPost<ServicePrice>('/serviceprice', data),
  update: (id: number, data: UpdateServicePriceRequest) =>
    apiPut<ServicePrice>(`/serviceprice/${id}`, data),
}

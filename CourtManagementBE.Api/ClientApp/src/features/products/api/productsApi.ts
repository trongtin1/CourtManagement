import type { Product } from '@/features/products/model/types'
import { httpClient } from '@/services/api/httpClient'
import type { ApiResponse, PageList, PaginationQuery } from '@/types/api'

type ServiceDto = {
  serviceID: number
  serviceCode: string
  serviceName: string
  serviceType: string
  maxQuantity: number
  isActive: boolean
}

const serviceEndpoints = {
  list: '/service',
}

export const getProducts = async (params?: PaginationQuery) => {
  const response = await httpClient.get<ApiResponse<PageList<ServiceDto>>>(serviceEndpoints.list, {
    params,
  })

  return {
    ...response.data.data,
    items: response.data.data.items.map<Product>((service) => ({
      id: service.serviceCode || String(service.serviceID),
      name: service.serviceName,
      category: service.serviceType || 'Service',
      price: 0,
      stock: service.maxQuantity,
      status: service.isActive ? 'Active' : 'Archived',
    })),
  }
}

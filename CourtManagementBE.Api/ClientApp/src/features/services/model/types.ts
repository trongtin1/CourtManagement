export type Service = {
  serviceID: number
  facilityID?: number | null
  serviceCode: string
  serviceName: string
  serviceType: string
  unit: string
  minQuantity: number
  maxQuantity: number
  createDate: string
  isActive: boolean
  servicePrices: ServicePrice[]
}

export type CreateServiceRequest = {
  facilityID?: number | null
  serviceCode: string
  serviceName: string
  serviceType?: string
  unit?: string
  minQuantity?: number
  maxQuantity?: number
  isActive?: boolean
}

export type UpdateServiceRequest = CreateServiceRequest

export type ServicePrice = {
  id: number
  serviceID: number
  price: number
  effectiveDate: string
  expiryDate: string | null
  createDate: string
}

export type CreateServicePriceRequest = {
  serviceID: number
  price: number
  effectiveDate: string
  expiryDate?: string | null
}

export type UpdateServicePriceRequest = CreateServicePriceRequest

export type Utility = {
  utilityID: number
  utilityCode: string
  utilityName: string
  description: string
  icon: string
  createDate: string
  isActive: boolean
}

export type CreateUtilityRequest = {
  utilityCode: string
  utilityName: string
  description?: string
  icon?: string
  isActive?: boolean
}

export type UpdateUtilityRequest = CreateUtilityRequest

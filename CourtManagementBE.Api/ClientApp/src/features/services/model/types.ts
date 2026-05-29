export type Service = {
  serviceID: number
  facilityID?: number | null
  serviceCode: string
  serviceName: string
  serviceType: string
  unitID?: number | null
  unit?: string
  minQuantity: number
  maxQuantity: number
  isTrackStock: boolean
  stockQuantity: number
  createDate: string
  isActive: boolean
  price: number
}

export type CreateServiceRequest = {
  facilityID?: number | null
  serviceCode: string
  serviceName: string
  serviceType?: string
  unitID?: number | null
  unit?: string
  minQuantity?: number
  maxQuantity?: number
  isTrackStock?: boolean
  stockQuantity?: number
  isActive?: boolean
  price?: number
}

export type UpdateServiceRequest = CreateServiceRequest

export type UnitConversion = {
  unitConversionID: number
  serviceID: number
  sourceUnitID: number
  sourceUnitName: string
  sourceUnitSymbol: string
  targetUnitID: number
  targetUnitName: string
  targetUnitSymbol: string
  factor: number
  isActive: boolean
  createdDate: string
}

export type UnitConversionRequest = {
  serviceID: number
  sourceUnitID: number
  targetUnitID: number
  factor: number
  isActive?: boolean
}


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

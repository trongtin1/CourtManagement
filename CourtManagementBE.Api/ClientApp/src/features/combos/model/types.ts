export type Combo = {
  comboID: number
  comboCode: string
  comboName: string
  description: string
  comboPrice: number
  durationHours: number
  isActive: boolean
  createdDate: string
  services: ComboService[]
}

export type ComboService = {
  serviceID: number
  serviceName: string
  serviceCode: string
  unit: string
  quantity: number
}

export type ComboRequest = {
  comboCode: string
  comboName: string
  description?: string
  comboPrice: number
  durationHours: number
  isActive?: boolean
  services?: ComboServiceRequest[]
}

export type ComboServiceRequest = {
  serviceID: number
  quantity: number
}

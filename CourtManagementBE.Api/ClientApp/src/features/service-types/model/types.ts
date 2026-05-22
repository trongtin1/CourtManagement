export type ServiceType = {
  serviceTypeID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
}
export type ServiceTypeRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

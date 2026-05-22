export type CustomerType = {
  customerTypeID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
  discountPercent: number
}
export type CustomerTypeRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  discountPercent?: number
}

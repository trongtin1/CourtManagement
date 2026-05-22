export type PaymentMethod = {
  paymentMethodID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
  isOnline: boolean
}
export type PaymentMethodRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  isOnline?: boolean
}

export type PaymentStatus = {
  paymentStatusID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
  colorCode: string
  isFinal: boolean
}

export type CreatePaymentStatusRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  colorCode?: string
  isFinal?: boolean
}

export type UpdatePaymentStatusRequest = CreatePaymentStatusRequest

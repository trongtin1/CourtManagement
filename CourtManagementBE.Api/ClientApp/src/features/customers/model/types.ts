export type Customer = {
  customerID: number
  userID: string | null
  customerName: string
  phone: string
  email: string
  customerType: string
  note: string
  isActive: boolean
  createDate: string
}

export type CreateCustomerRequest = {
  userID?: string | null
  customerName: string
  phone?: string
  email?: string
  customerType?: string
  note?: string
  isActive?: boolean
}

export type UpdateCustomerRequest = {
  customerName: string
  phone?: string
  email?: string
  customerType?: string
  note?: string
  isActive?: boolean
}

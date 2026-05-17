export type CustomerType = { customerTypeID: number; code: string; name: string; description: string; sortOrder: number; isActive: boolean; createdDate: string; discountPercent: number }
export type CreateCustomerTypeRequest = { code: string; name: string; description?: string; sortOrder?: number; isActive?: boolean; discountPercent?: number }
export type UpdateCustomerTypeRequest = CreateCustomerTypeRequest

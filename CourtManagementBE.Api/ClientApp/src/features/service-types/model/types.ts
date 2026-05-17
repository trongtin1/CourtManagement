export type ServiceType = { serviceTypeID: number; code: string; name: string; description: string; sortOrder: number; isActive: boolean; createdDate: string }
export type CreateServiceTypeRequest = { code: string; name: string; description?: string; sortOrder?: number; isActive?: boolean }
export type UpdateServiceTypeRequest = CreateServiceTypeRequest

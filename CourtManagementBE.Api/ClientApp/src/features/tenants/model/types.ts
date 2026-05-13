export type Tenant = {
  tenantID: number
  tenantName: string
  domain: string
  createdDate: string
  isActive: boolean
}

export type CreateTenantRequest = {
  tenantName: string
  domain: string
  isActive?: boolean
}

export type UpdateTenantRequest = {
  tenantName: string
  domain: string
  isActive: boolean
}

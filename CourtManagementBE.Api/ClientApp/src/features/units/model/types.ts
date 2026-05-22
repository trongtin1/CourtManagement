export type Unit = {
  unitID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
  symbol: string
}
export type UnitRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  symbol?: string
}

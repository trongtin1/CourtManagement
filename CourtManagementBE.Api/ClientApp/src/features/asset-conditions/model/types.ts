export type AssetCondition = {
  assetConditionID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
  colorCode: string
  isUsable: boolean
}
export type AssetConditionRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  colorCode?: string
  isUsable?: boolean
}

import type { CourtFeatureCategory } from '@/features/court-feature-categories/model/types'

export type Court = {
  courtID: number
  facilityID: number
  courtTypeID: number
  courtCode: string
  courtName: string
  statusID: number
  length: number
  width: number
  capacity: number
  sortOrder: number
  description: string
  imageURL: string
  isActive: boolean
  createDate: string
}

export type CreateCourtRequest = {
  facilityID: number
  courtTypeID: number
  courtCode: string
  courtName: string
  statusID: number
  length?: number
  width?: number
  capacity?: number
  sortOrder?: number
  description?: string
  imageURL?: string
  isActive?: boolean
}

export type UpdateCourtRequest = {
  courtTypeID: number
  courtCode: string
  courtName: string
  statusID: number
  length?: number
  width?: number
  capacity?: number
  sortOrder?: number
  description?: string
  imageURL?: string
  isActive?: boolean
}

export type CourtType = {
  courtTypeID: number
  code: string
  name: string
  description: string
  isActive: boolean
}

export type CreateCourtTypeRequest = {
  code: string
  name: string
  description?: string
  isActive?: boolean
}

export type UpdateCourtTypeRequest = CreateCourtTypeRequest

export type CourtStatus = {
  statusID: number
  statusCode: string
  statusName: string
  colorCode: string
  description: string
  createDate: string
  isActive: boolean
}

export type CreateCourtStatusRequest = {
  statusCode: string
  statusName: string
  colorCode?: string
  description?: string
  isActive?: boolean
}

export type UpdateCourtStatusRequest = CreateCourtStatusRequest

export type CourtFeature = {
  courtFeatureID: number
  featureCode: string
  featureName: string
  courtFeatureCategoryID: number
  courtFeatureCategory: CourtFeatureCategory
  description: string
  createDate: string
  createdBy: string
  isActive: boolean
}

export type CreateCourtFeatureRequest = {
  featureCode: string
  featureName: string
  courtFeatureCategoryID: number
  description?: string
  isActive?: boolean
}

export type UpdateCourtFeatureRequest = CreateCourtFeatureRequest

export type CourtFeatureMapping = {
  courtFeatureMappingID: number
  courtID: number
  courtFeatureID: number
  createDate: string
}

export type CreateCourtFeatureMappingRequest = {
  courtID: number
  courtFeatureID: number
}

export type CourtAsset = {
  courtAssetID: number
  courtID: number
  assetCode: string
  assetName: string
  category: string
  quantity: number
  unit: string
  condition: string
  purchaseDate?: string | null
  purchasePrice?: number | null
  lastMaintenanceDate?: string | null
  nextMaintenanceDate?: string | null
  note: string
  isActive: boolean
  createDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
}

export type CreateCourtAssetRequest = {
  courtID: number
  assetCode: string
  assetName: string
  category?: string
  quantity?: number
  unit?: string
  condition?: string
  purchaseDate?: string | null
  purchasePrice?: number | null
  lastMaintenanceDate?: string | null
  nextMaintenanceDate?: string | null
  note?: string
  isActive?: boolean
}

export type UpdateCourtAssetRequest = Omit<CreateCourtAssetRequest, 'courtID'>

export type TimeSlot = {
  timeSlotID: number
  slotName: string
  startTime: string
  endTime: string
  isActive: boolean
}

export type CreateTimeSlotRequest = {
  slotName: string
  startTime: string
  endTime: string
  isActive?: boolean
}

export type UpdateTimeSlotRequest = {
  slotName: string
  startTime: string
  endTime: string
  isActive?: boolean
}

export type CourtPrice = {
  courtPriceRuleID: number
  courtID: number
  timeSlotID?: number
  priceRuleTypeID?: number | null
  dayOfWeek?: number | null
  specificDate?: string | null
  startTime: string
  endTime: string
  price: number
  isActive: boolean
  createdDate: string
  updatedDate?: string | null
  isMapping?: boolean
}

export type CreateCourtPriceRequest = {
  courtID: number
  priceRuleTypeID?: number | null
  dayOfWeek?: number | null
  specificDate?: string | null
  startTime: string
  endTime: string
  price: number
  isActive?: boolean
}

export type UpdateCourtPriceRequest = CreateCourtPriceRequest

export type PriceRuleType = {
  priceRuleTypeID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
  colorCode: string
}

export type CreatePriceRuleTypeRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  colorCode?: string
}

export type UpdatePriceRuleTypeRequest = CreatePriceRuleTypeRequest

export type CourtDefaultPriceRule = {
  courtDefaultPriceRuleID: number
  priceRuleTypeID?: number | null
  dayOfWeek?: number | null
  specificDate?: string | null
  startTime: string
  endTime: string
  price: number
  isMapping: boolean
  isLoadDefault: boolean
  isActive: boolean
  createdDate: string
  updatedDate?: string | null
}

export type CreateCourtDefaultPriceRuleRequest = {
  priceRuleTypeID?: number | null
  dayOfWeek?: number | null
  specificDate?: string | null
  startTime: string
  endTime: string
  price: number
  isMapping?: boolean
  isLoadDefault?: boolean
  isActive?: boolean
}

export type UpdateCourtDefaultPriceRuleRequest = CreateCourtDefaultPriceRuleRequest

export type CourtAreaMapping = {
  courtAreaMappingID: number
  courtID: number
  areaID: number
  positionX: number
  positionY: number
  displayOrder: number
  createDate: string
}

export type CreateCourtAreaMappingRequest = {
  courtID: number
  areaID: number
  positionX?: number
  positionY?: number
  displayOrder?: number
}

export type UpdateCourtAreaMappingRequest = {
  positionX: number
  positionY: number
  displayOrder: number
}

export type CourtUtility = {
  courtUtilitiesID: number
  courtID: number
  utilityID: number
  createDate: string
}

export type CreateCourtUtilityRequest = {
  courtID: number
  utilityID: number
}

export type CourtPriceHistory = {
  courtPriceHistoryID: number
  courtPriceByTimeSlotID: number
  courtID: number
  timeSlotID: number
  dayOfWeek: number
  oldPrice: number
  newPrice: number
  changeDate: string
  changedBy: string
  reason: string
}

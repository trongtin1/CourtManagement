export type Area = {
  areaID: number
  facilityID: number
  areaCode: string
  areaName: string
  totalLength: number
  totalWidth: number
  description: string
  createdDate: string
  isActive: boolean
}

export type CreateAreaRequest = {
  facilityID: number
  areaCode: string
  areaName: string
  totalLength?: number
  totalWidth?: number
  description?: string
  isActive?: boolean
}

export type UpdateAreaRequest = {
  areaCode: string
  areaName: string
  totalLength?: number
  totalWidth?: number
  description?: string
  isActive?: boolean
}

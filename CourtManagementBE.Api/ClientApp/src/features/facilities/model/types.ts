export type Facility = {
  facilityID: number
  facilityName: string
  address: string
  phone: string
  email: string
  openingTime: string
  closingTime: string
  imageURL: string
  description: string
  createDate: string
  isActive: boolean
}

export type CreateFacilityRequest = {
  facilityName: string
  address?: string
  phone?: string
  email?: string
  openingTime?: string
  closingTime?: string
  imageURL?: string
  description?: string
  isActive?: boolean
}

export type UpdateFacilityRequest = {
  facilityName: string
  address?: string
  phone?: string
  email?: string
  openingTime?: string
  closingTime?: string
  imageURL?: string
  description?: string
  isActive?: boolean
}

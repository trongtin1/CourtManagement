export const BookingStatusConstants = {
  Pending: '001',
  Confirmed: '002',
  CheckedIn: '003',
  Completed: '004',
  Cancelled: '005',
  NoShow: '006',
} as const

export type BookingStatusValue =
  (typeof BookingStatusConstants)[keyof typeof BookingStatusConstants]

export const BookingStatusNameMap = {
  [BookingStatusConstants.Pending]: 'Pending',
  [BookingStatusConstants.Confirmed]: 'Confirmed',
  [BookingStatusConstants.CheckedIn]: 'CheckedIn',
  [BookingStatusConstants.Completed]: 'Completed',
  [BookingStatusConstants.Cancelled]: 'Cancelled',
  [BookingStatusConstants.NoShow]: 'NoShow',
} as const

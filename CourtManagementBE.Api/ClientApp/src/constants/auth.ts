export const AUTH_STORAGE_KEYS = {
  token: 'court_management.auth.token',
  user: 'court_management.auth.user',
  workingFacilityId: 'court_management.working_facility_id',
} as const

export const AUTH_EVENTS = {
  unauthorized: 'auth:unauthorized',
} as const

export type AuthUser = {
  id: string
  fullName: string
  email: string
  facilityID?: number | null
  roles: string[]
}

export type LoginRequest = {
  email?: string
  password?: string
}

export type LoginResponse = {
  accessToken: string
  user: AuthUser
}

export type AuthState = {
  token: string | null
  user: AuthUser | null
}

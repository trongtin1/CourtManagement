import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { authStorage } from '@/features/auth/model/authStorage'
import type { AuthState, AuthUser, LoginResponse } from '@/features/auth/model/types'
import type { RootState } from '@/store'

const initialState: AuthState = {
  token: authStorage.getToken(),
  user: authStorage.getUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.token = action.payload.accessToken
      state.user = action.payload.user
      authStorage.setSession(action.payload.accessToken, action.payload.user)
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload

      if (state.token) {
        authStorage.setSession(state.token, action.payload)
      }
    },
    logout: (state) => {
      state.token = null
      state.user = null
      authStorage.clearSession()
    },
  },
})

export const { logout, setCredentials, setUser } = authSlice.actions

export const selectAuth = (state: RootState) => state.auth
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.token)

export const authReducer = authSlice.reducer

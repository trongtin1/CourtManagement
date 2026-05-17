import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/hooks/redux'
import { storage } from '@/utils/storage'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectCurrentUser)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  const isSuperAdmin = currentUser?.roles?.some((role) =>
    ['SuperAdmin', 'Administrator'].includes(role),
  )
  const hasFacilityMode = Boolean(
    storage.get<string>(AUTH_STORAGE_KEYS.workingFacilityId),
  )

  if (isSuperAdmin && !hasFacilityMode && location.pathname !== ROUTES.selectFacility) {
    return <Navigate to={ROUTES.selectFacility} replace />
  }

  return children
}

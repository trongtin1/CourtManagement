import { useEffect } from 'react'

import { AUTH_EVENTS } from '@/constants/auth'
import { ROUTES } from '@/constants/routes'
import { logout } from '@/features/auth/model/authSlice'
import { useAppDispatch } from '@/hooks/redux'

export function AuthEventBridge() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout())

      if (window.location.pathname !== ROUTES.login) {
        window.location.assign(ROUTES.login)
      }
    }

    window.addEventListener(AUTH_EVENTS.unauthorized, handleUnauthorized)

    return () => {
      window.removeEventListener(AUTH_EVENTS.unauthorized, handleUnauthorized)
    }
  }, [dispatch])

  return null
}

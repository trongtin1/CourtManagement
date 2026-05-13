import { useMutation, useQuery } from '@tanstack/react-query'

import { getCurrentUser, login } from '@/features/auth/api/authApi'
import { selectIsAuthenticated } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/hooks/redux'

export const authQueryKeys = {
  all: ['auth'] as const,
  me: () => [...authQueryKeys.all, 'me'] as const,
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
  })
}

export const useCurrentUserQuery = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
  })
}

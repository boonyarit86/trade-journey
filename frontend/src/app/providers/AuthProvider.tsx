import { useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { authReducer, initialAuthState } from '../../features/auth/authSlice.ts'
import { loginMock, signupMock } from '../../features/auth/services/authApi.tsx'
import type { AuthContextValue } from './AuthContext.ts'
import { AuthContext } from './AuthContext.ts'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      login: async (payload) => {
        dispatch({ type: 'auth/start' })
        try {
          const user = await loginMock(payload)
          dispatch({ type: 'auth/success', payload: user })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unexpected error'
          dispatch({ type: 'auth/error', payload: message })
        }
      },
      signup: async (payload) => {
        dispatch({ type: 'auth/start' })
        try {
          const user = await signupMock(payload)
          dispatch({ type: 'auth/success', payload: user })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unexpected error'
          dispatch({ type: 'auth/error', payload: message })
        }
      },
      logout: () => dispatch({ type: 'auth/logout' }),
      setMode: (mode) => dispatch({ type: 'auth/setMode', payload: mode }),
    }
  }, [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

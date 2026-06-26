import { createContext } from 'react'
import type { AuthMode, AuthState, LoginPayload, SignupPayload } from '../../features/auth/types.ts'

export interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => void
  setMode: (mode: AuthMode) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

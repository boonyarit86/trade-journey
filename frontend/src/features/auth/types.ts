export type AuthMode = 'login' | 'signup'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  mode: AuthMode
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
}

import type { AuthMode, AuthState, AuthUser } from './types.ts'

type AuthAction =
  | { type: 'auth/start' }
  | { type: 'auth/success'; payload: AuthUser }
  | { type: 'auth/error'; payload: string }
  | { type: 'auth/logout' }
  | { type: 'auth/setMode'; payload: AuthMode }

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
  mode: 'login',
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'auth/start':
      return { ...state, loading: true, error: null }
    case 'auth/success':
      return { ...state, loading: false, user: action.payload, error: null }
    case 'auth/error':
      return { ...state, loading: false, error: action.payload }
    case 'auth/logout':
      return { ...state, user: null, loading: false, error: null }
    case 'auth/setMode':
      return { ...state, mode: action.payload, error: null }
    default:
      return state
  }
}

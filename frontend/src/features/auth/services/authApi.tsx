import type { AuthUser, LoginPayload, SignupPayload } from '../types.ts'

const DEMO_DELAY = 600

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function loginMock(payload: LoginPayload): Promise<AuthUser> {
  await wait(DEMO_DELAY)
  if (!payload.email.includes('@') || payload.password.length < 4) {
    throw new Error('Invalid credentials. Try demo@example.com / 1234')
  }

  return {
    id: 'u_001',
    name: 'Demo User',
    email: payload.email,
    role: 'member',
  }
}

export async function signupMock(payload: SignupPayload): Promise<AuthUser> {
  await wait(DEMO_DELAY)
  if (payload.name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters')
  }

  return {
    id: 'u_002',
    name: payload.name,
    email: payload.email,
    role: 'admin',
  }
}

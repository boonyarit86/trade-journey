import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import { Input } from '../../../shared/ui/Input.tsx'

export function LoginForm() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('1234')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await login({ email, password })
  }

  return (
    <Card title="Login">
      <form onSubmit={handleSubmit} className="stack-md">
        <Input label="Email" value={email} onChange={setEmail} />
        <Input label="Password" value={password} onChange={setPassword} type="password" />
        <Button type="submit" label={loading ? 'Logging in...' : 'Login'} disabled={loading} />
      </form>
    </Card>
  )
}

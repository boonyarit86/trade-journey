import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { Button } from '../../../shared/ui/Button.tsx'
import { Card } from '../../../shared/ui/Card.tsx'
import { Input } from '../../../shared/ui/Input.tsx'

export function SignupForm() {
  const { signup, loading } = useAuth()
  const [name, setName] = useState('Jane')
  const [email, setEmail] = useState('jane@example.com')
  const [password, setPassword] = useState('1234')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await signup({ name, email, password })
  }

  return (
    <Card title="Sign up">
      <form onSubmit={handleSubmit} className="stack-md">
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Email" value={email} onChange={setEmail} />
        <Input label="Password" value={password} onChange={setPassword} type="password" />
        <Button
          type="submit"
          label={loading ? 'Creating account...' : 'Create account'}
          disabled={loading}
        />
      </form>
    </Card>
  )
}

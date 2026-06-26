import { LoginForm } from './components/LoginForm.tsx'
import { SignupForm } from './components/SignupForm.tsx'
import { useAuth } from './hooks/useAuth.ts'
import { Button } from '../../shared/ui/Button.tsx'

export function AuthScreen() {
  const { mode, error, setMode } = useAuth()

  return (
    <section className="stack-lg">
      <header className="stack-sm">
        <h1>Feature-based Auth Module</h1>
        <p className="subtle">
          This screen is composed from files inside <code>features/auth</code>.
        </p>
      </header>

      {mode === 'login' ? <LoginForm /> : <SignupForm />}

      {error ? <p className="error">{error}</p> : null}

      <div className="row">
        <Button
          label="Use Login Form"
          variant={mode === 'login' ? 'primary' : 'secondary'}
          onClick={() => setMode('login')}
        />
        <Button
          label="Use Signup Form"
          variant={mode === 'signup' ? 'primary' : 'secondary'}
          onClick={() => setMode('signup')}
        />
      </div>
    </section>
  )
}

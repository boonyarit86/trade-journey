import { StatsCards } from './components/StatsCards.tsx'
import { metricCardsMock } from './mocks.ts'
import { useAuth } from '../auth/hooks/useAuth.ts'
import { Button } from '../../shared/ui/Button.tsx'
import { TasksPanel } from '../tasks/index.tsx'
import { toTitleCase } from '../../utils/format.ts'

export function DashboardScreen() {
  const { user, logout } = useAuth()

  return (
    <section className="stack-lg">
      <header className="stack-sm">
        <h1>Dashboard Feature</h1>
        <p className="subtle">
          Welcome, <strong>{user?.name ?? 'Guest'}</strong> ({toTitleCase(user?.role ?? 'member')})
        </p>
      </header>
      <StatsCards metrics={metricCardsMock} />
      <TasksPanel />
      <div className="row">
        <Button label="Logout" onClick={logout} />
      </div>
    </section>
  )
}

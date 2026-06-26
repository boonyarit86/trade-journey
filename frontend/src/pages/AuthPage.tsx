import { AuthScreen } from '../features/auth/index.tsx'
import { AppLayout } from '../layout/AppLayout.tsx'
import { usePageTitle } from '../hooks/usePageTitle.ts'

export function AuthPage() {
  usePageTitle('Sample App - Auth')

  return (
    <AppLayout title="Sample Project" subtitle="Page layer composes auth feature">
      <AuthScreen />
    </AppLayout>
  )
}

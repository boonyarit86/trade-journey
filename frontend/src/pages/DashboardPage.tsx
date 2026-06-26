import { DashboardScreen } from '../features/dashboard/index.tsx'
import { usePageTitle } from '../hooks/usePageTitle.ts'

export function DashboardPage() {
  usePageTitle('Sample App - Dashboard')

  return <DashboardScreen />
}

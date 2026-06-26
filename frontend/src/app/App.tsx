import { AuthProvider } from './providers/AuthProvider.tsx'
import { AppRoutes } from '../routes/index.tsx'

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

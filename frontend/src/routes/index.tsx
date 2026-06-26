import { DashboardPage } from '../pages/DashboardPage.tsx';
import { useAuth } from '../features/auth/hooks/useAuth.ts';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppLayout } from '../layout/AppLayout.tsx';
import { ProjectPage } from '../pages/ProjectPage.tsx';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: DashboardPage,
      },
      {
        path: "/project",
        Component: ProjectPage,
      }
    ]
  },
]);

export function AppRoutes() {
  // const { user } = useAuth()
  // return <DashboardPage />

  // return (
  //   <RouterProvider router={router}>
  //     <AppLayout title="Sample Project" subtitle="Page layer composes dashboard and tasks features" />
  //   </RouterProvider>
  // )

  return <RouterProvider router={router} />
}

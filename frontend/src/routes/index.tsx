import { DashboardPage } from '../pages/DashboardPage.tsx';
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
      },
      {
        path: "/asset",
        children: [
          {
            path: "type",
            Component: () => <h1>Asset Type</h1>
          }
        ]
      }
    ]
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />
}

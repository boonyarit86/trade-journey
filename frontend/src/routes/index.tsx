import { DashboardPage } from '../pages/DashboardPage.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppLayout } from '../layout/AppLayout.tsx';
import { ProjectPage } from '../pages/ProjectPage.tsx';
import { AssetTypePage } from '../pages/AssetTypePage.tsx';

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
            Component: AssetTypePage
          }
        ]
      }
    ]
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />
}

import { DashboardPage } from '../pages/DashboardPage.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppLayout } from '../layout/AppLayout.tsx';
import { ProjectPage } from '../pages/ProjectPage.tsx';
import { AssetTypePage } from '../pages/AssetTypePage.tsx';
import { AssetItemPage } from '../pages/AssetItemPage.tsx';
import { ChecklistPage } from '../pages/ChecklistPage.tsx';
import { StrategyPage } from '../pages/StrategyPage.tsx';
import { PortfolioPage } from '../pages/PortfolioPage.tsx';

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
          },
          {
            path: "item",
            Component: AssetItemPage
          }
        ]
      },
      {
        path: "/trading-setup",
        children: [
          {
            path: "checklist",
            Component: ChecklistPage
          },
          {
            path: "strategy",
            Component: StrategyPage
          },
          {
            path: "portfolio",
            Component: PortfolioPage
          }
        ]
      }
    ]
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />
}

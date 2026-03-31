import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import './styles/globals.css';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { AppProviders } from './providers/AppProviders';
import { Skeleton } from './components/ui/Skeleton';

// Lazy load as páginas
const AccountsPage = lazy(() => import('./features/accounts/AccountsPage').then(module => ({ default: module.AccountsPage })));
const BillsPage = lazy(() => import('./features/bills/BillsPage').then(module => ({ default: module.BillsPage })));
const DashboardOverview = lazy(() => import('./features/dashboard/DashboardOverview').then(module => ({ default: module.DashboardOverview })));
const GoalsPage = lazy(() => import('./features/goals/GoalsPage').then(module => ({ default: module.GoalsPage })));
const InvestmentsPage = lazy(() => import('./features/investments/InvestmentsPage').then(module => ({ default: module.InvestmentsPage })));

const PageFallback = () => (
  <div className="flex flex-col gap-4 p-8 w-full h-full">
    <Skeleton className="h-10 w-48 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
    <Skeleton className="h-64 w-full mt-4" />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <DashboardOverview />
          </Suspense>
        ),
      },
      {
        path: 'accounts',
        element: (
          <Suspense fallback={<PageFallback />}>
            <AccountsPage />
          </Suspense>
        ),
      },
      {
        path: 'investments',
        element: (
          <Suspense fallback={<PageFallback />}>
            <InvestmentsPage />
          </Suspense>
        ),
      },
      {
        path: 'goals',
        element: (
          <Suspense fallback={<PageFallback />}>
            <GoalsPage />
          </Suspense>
        ),
      },
      {
        path: 'bills',
        element: (
          <Suspense fallback={<PageFallback />}>
            <BillsPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function App() {
  return (
    <AppProviders>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </AppProviders>
  );
}


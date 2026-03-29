import './styles/globals.css';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { AccountsPage } from './features/accounts/AccountsPage';
import { BillsPage } from './features/bills/BillsPage';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { GoalsPage } from './features/goals/GoalsPage';

import { AppProviders } from './providers/AppProviders';

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
        element: <DashboardOverview />,
      },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'bills', element: <BillsPage /> },
    ],
  },
]);

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
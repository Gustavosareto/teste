import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';

// O DashboardLayout teoricamente já existe conforme a entrega anterior.
// import { DashboardLayout } from './components/layouts/DashboardLayout';
import { DashboardOverview } from './features/dashboard/DashboardOverview';

// Mock do Layout pra o app compilar se chamado solto aqui, assumindo que foi importado no projeto.
const DashboardLayout = ({ children }: any) => <div className="layout">{children || <Navigate to="/dashboard" />}</div>

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    // Na prática: element: <DashboardLayout />
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardOverview />,
      },
      // Futuras rotas vão aqui
      { path: 'accounts', element: <p>Accounts (WIP)</p> },
      { path: 'goals', element: <p>Goals (WIP)</p> },
      { path: 'bills', element: <p>Bills (WIP)</p> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
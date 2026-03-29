 
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { AccountsPage } from '../features/accounts/AccountsPage';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../features/accounts/AccountsPage', () => ({
  AccountsPage: () => <h1>Minhas Contas Mock</h1>
}));

describe('Router Integration', () => {
  it('renders layout and matches child route', () => {
    const testQueryClient = new QueryClient();

    const router = createMemoryRouter([
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <div>Overview Content Mock</div> },
          { path: 'accounts', element: <AccountsPage /> }
        ]
      }
    ], {
      initialEntries: ['/dashboard/accounts'],
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    // Child route contents
    expect(screen.getByRole('heading', { name: /minhas contas mock/i })).toBeInTheDocument();
  });
});

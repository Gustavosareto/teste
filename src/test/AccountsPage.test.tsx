import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountsPage } from '../features/accounts/AccountsPage';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as queries from '../features/finance/api/queries';

// Mock das queries para controlar estado da Promise
vi.mock('../features/finance/api/queries', async () => {
  const actual = await vi.importActual('../features/finance/api/queries');
  return {
    ...actual as object,
    useAccounts: vi.fn(),
  };
});

function renderWithProviders(ui: React.ReactElement) {
  const testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AccountsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when fetching', () => {
    vi.mocked(queries.useAccounts).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<AccountsPage />);
    
    // Header should be there
    expect(screen.getByText('Minhas Contas')).toBeInTheDocument();
  });

  it('renders data table when successful', async () => {
    vi.mocked(queries.useAccounts).mockReturnValue({
      data: [
        {
          id: '1',
          name: 'Conta Teste 1',
          institution: 'MockBank',
          type: 'corrente',
          currentBalance: 1500,
          lastUpdate: '2026-03-29',
        }
      ],
      isPending: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText('Conta Teste 1')).toBeInTheDocument();
      expect(screen.getByText('MockBank')).toBeInTheDocument();
    });
  });

  it('renders error state', async () => {
    vi.mocked(queries.useAccounts).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Internal Server Error'),
    } as any);

    renderWithProviders(<AccountsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Internal Server Error');
  });
});

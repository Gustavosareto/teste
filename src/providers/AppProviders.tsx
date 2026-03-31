import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ReactNode } from 'react';
import { PrivacyProvider } from './PrivacyProvider';

// Centraliza a configuração do QueryClient para facilitar testes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Menos chamadas na tela de teste
      retry: 1, // Tenta 1 vez se falhar mock
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      // Exibe sucesso genérico para mutações, a menos que tenham a tag { meta: { disableToast: true } }
      if (mutation.meta?.disableToast !== true) {
        toast.success(mutation.meta?.successMessage as string || 'Ação realizada com sucesso!');
      }
    },
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.disableToast !== true) {
        toast.error(mutation.meta?.errorMessage as string || `Erro: ${error.message}`);
      }
    },
  }),
});

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivacyProvider>
        {children}
      </PrivacyProvider>
    </QueryClientProvider>
  );
}

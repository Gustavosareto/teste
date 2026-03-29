import { useState } from 'react';
import { PageMetadata } from '../../components/seo/PageMetadata';
import { CurrencyFormat } from '../../components/ui/CurrencyFormat';
import { Typography } from '../../components/ui/Typography';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { useAccounts } from '../finance/api/queries';
import { AccountCard } from './components/AccountCard';
import { AccountForm } from './components/AccountForm';
import { BankAccount } from '../finance/types';

function AccountCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton width="w-12" height="h-12" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton width="w-24" height="h-4" rounded="sm" />
          <Skeleton width="w-16" height="h-3" rounded="sm" />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-50 space-y-2">
        <Skeleton width="w-16" height="h-3" rounded="sm" />
        <Skeleton width="w-32" height="h-8" rounded="sm" />
      </div>
    </div>
  );
}

export function AccountsPage() {
  const { data: accounts, isPending, isError, error } = useAccounts();
  const totalBalance = accounts?.reduce((sum, account) => sum + account.currentBalance, 0) ?? 0;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | undefined>(undefined);

  const handleOpenModal = (account?: BankAccount) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAccountToEdit(undefined);
  };

  return (
    <section className="space-y-8" aria-labelledby="accounts-heading">
      <PageMetadata
        title="Contas bancárias e saldos | MyFinance Pro"
        description="Visualize saldo por conta, instituição e data de atualização para manter seu controle financeiro centralizado."
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Typography variant="h1" id="accounts-heading">
            Minhas Contas
          </Typography>
          <Typography variant="body" color="muted">
            Visão consolidada de contas correntes, poupanças e investimentos.
          </Typography>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:w-auto transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Adicionar Conta
        </button>
      </header>

      <article className="rounded-2xl bg-slate-900 text-white p-6 shadow-lg sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <Typography variant="body" className="text-slate-300 text-sm font-medium uppercase tracking-wider mb-2 block">
            Patrimônio Consolidado
          </Typography>
          {isPending ? (
            <Skeleton width="w-48" height="h-10" className="mt-2 opacity-50" rounded="md" />
          ) : (
            <Typography variant="h1" as="p" className="text-3xl sm:text-4xl text-white">
              <CurrencyFormat value={totalBalance} />
            </Typography>
          )}
        </div>
      </article>

      {isError ? (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-200" role="alert">
          <strong>Erro ao buscar contas:</strong> {error.message}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Lista de contas bancárias">
          {isPending ? (
            <>
              <AccountCardSkeleton />
              <AccountCardSkeleton />
              <AccountCardSkeleton />
            </>
          ) : (
            accounts?.map((account) => (
              <AccountCard key={account.id} account={account} onEdit={handleOpenModal} />
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={accountToEdit ? "Editar Conta" : "Nova Conta Bancária"}
        >
          <AccountForm 
            initialData={accountToEdit}
            onSuccess={handleCloseModal} 
            onCancel={handleCloseModal} 
          />
        </Modal>
      )}
    </section>
  );
}

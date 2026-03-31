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
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton width="w-12" height="h-12" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton width="w-24" height="h-4" rounded="sm" />
          <Skeleton width="w-16" height="h-3" rounded="sm" />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 space-y-2">
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
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-md dark:shadow-black/20 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:ring-offset-2 sm:w-auto transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Adicionar Conta
        </button>
      </header>

      <article className="rounded-2xl bg-slate-900 text-white p-5 shadow-lg flex flex-col items-center justify-center gap-2 border border-slate-800 relative min-h-[100px]">
        <Typography variant="body" className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">
          Patrimônio Consolidado
        </Typography>
        
        <div className="flex items-center justify-center w-full max-w-md px-4">
          {isPending ? (
            <Skeleton width="w-48" height="h-10" className="opacity-20" rounded="md" />
          ) : (
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-medium text-slate-500 select-none">R$</span>
              <Typography variant="h1" as="span" className="text-3xl sm:text-4xl text-white font-bold tracking-tight">
                <CurrencyFormat value={totalBalance} showSymbol={false} />
              </Typography>
            </div>
          )}
        </div>

        <div className="absolute right-5 bottom-4 hidden sm:flex items-center gap-1.5 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
          <svg className="w-3 h-3 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Protegido
        </div>
      </article>

      {isError ? (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/30 text-red-600 rounded-2xl border border-red-200" role="alert">
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
    </section>
  );
}

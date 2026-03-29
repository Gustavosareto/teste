import React, { Suspense, useState } from 'react';
import { Typography } from '../../components/ui/Typography';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import {
  getExpenseCategoryPercentages,
  getFinancialSummary,
} from '../finance/selectors';
import { useCashFlow, useExpenses } from '../finance/api/queries';
import { ExpenseBreakdownList } from './components/ExpenseBreakdownList';
import { SummaryCard } from './components/SummaryCard';
import { TransactionForm } from './components/TransactionForm';

const LazyCashFlowChart = React.lazy(() => import('./components/CashFlowChart').then((module) => ({ default: module.CashFlowChart })));

function SummaryCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
      <Skeleton width="w-24" height="h-3" rounded="sm" />
      <Skeleton width="w-40" height="h-8" rounded="md" />
    </div>
  );
}

export function DashboardOverview() {
  const { data: cashFlow, isPending: isCashFlowPending } = useCashFlow();
  const { data: expenses, isPending: isExpensesPending } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const summary = cashFlow ? getFinancialSummary(cashFlow) : { currentBalance: 0, totalIncome: 0, totalExpense: 0 };
  const categoryBreakdown = expenses ? getExpenseCategoryPercentages(expenses) : [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h1">Visão Geral</Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Acompanhe entradas, saídas e distribuição das despesas com contexto mensal.
          </Typography>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:w-auto transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nova Transação
        </button>
      </header>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Resumo Financeiro
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {isCashFlowPending ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : (
            <>
              <Suspense fallback={<SummaryCardSkeleton />}>
                <SummaryCard title="Saldo do semestre" amount={summary.currentBalance} tone="balance" />
              </Suspense>
              <Suspense fallback={<SummaryCardSkeleton />}>
                <SummaryCard title="Receitas acumuladas" amount={summary.totalIncome} tone="income" />
              </Suspense>
              <Suspense fallback={<SummaryCardSkeleton />}>
                <SummaryCard title="Despesas acumuladas" amount={summary.totalExpense} tone="expense" />
              </Suspense>
            </>
          )}
        </div>
      </section>

      <section
        aria-labelledby="charts-heading"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
      >
        <h2 id="charts-heading" className="sr-only">
          Gráficos Analíticos
        </h2>

        <article className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[24rem] flex flex-col">
          <Typography variant="h3" className="mb-6">
            Fluxo de Caixa
          </Typography>
          <div className="flex-1 w-full h-full">
            <Suspense
              fallback={
                <div className="w-full h-full min-h-[300px] flex items-end gap-4 justify-between opacity-50 px-4" aria-hidden="true">
                  <Skeleton width="w-full" height="h-1/3" rounded="sm" />
                  <Skeleton width="w-full" height="h-2/3" rounded="sm" />
                  <Skeleton width="w-full" height="h-1/2" rounded="sm" />
                  <Skeleton width="w-full" height="h-3/4" rounded="sm" />
                  <Skeleton width="w-full" height="h-1/4" rounded="sm" />
                  <Skeleton width="w-full" height="h-full" rounded="sm" />
                </div>
              }
            >
              {!isCashFlowPending && cashFlow ? <LazyCashFlowChart data={cashFlow} /> : null}
            </Suspense>
          </div>
        </article>

        <article className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[24rem] flex flex-col">
          <Typography variant="h3" className="mb-6">
            Despesas por Categoria
          </Typography>
          <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            {isExpensesPending ? (
              <div className="space-y-4">
                <Skeleton width="w-full" height="h-10" />
                <Skeleton width="w-full" height="h-10" />
                <Skeleton width="w-full" height="h-10" />
              </div>
            ) : (
              <ExpenseBreakdownList categories={categoryBreakdown} />
            )}
          </div>
        </article>
      </section>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nova Transação"
        >
          <TransactionForm 
            onSuccess={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

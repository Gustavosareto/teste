import React, { Suspense } from 'react';
import { Typography } from '../../components/ui/Typography';
import { CurrencyFormat } from '../../components/ui/CurrencyFormat';
import { Skeleton } from '../../components/ui/Skeleton';
import { mockCashFlowData } from './mocks/dashboardData';

// Simulando um componente isolado para possibilitar importação lazy e fallbacks perfeitamente encaixados
const SummaryCard = React.lazy(
  () =>
    new Promise<{ default: React.ComponentType<any> }>((resolve) =>
      setTimeout(
        () =>
          resolve({
            default: ({
              title,
              amount,
              type,
            }: {
              title: string;
              amount: number;
              type: 'income' | 'expense' | 'balance';
            }) => (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                <Typography variant="label" color="muted">
                  {title}
                </Typography>
                <Typography
                  variant="h2"
                  color={
                    type === 'expense'
                      ? 'error'
                      : type === 'income'
                      ? 'success'
                      : 'primary'
                  }
                >
                  <CurrencyFormat value={amount} />
                </Typography>
              </div>
            ),
          }),
        1200 // Mock delay para demonstrar o Skeleton
      )
    )
);

const LazyCashFlowChart = React.lazy(
  () =>
    new Promise<{ default: React.ComponentType<any> }>((resolve) =>
      setTimeout(
        () =>
          import('./components/CashFlowChart').then((module) =>
            resolve({ default: module.CashFlowChart })
          ),
        1500
      )
    )
);

function SummaryCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
      <Skeleton width="w-24" height="h-3" rounded="sm" />
      <Skeleton width="w-40" height="h-8" rounded="md" />
    </div>
  );
}

export function DashboardOverview() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <Typography variant="h1">Visão Geral</Typography>
        <Typography variant="body" color="muted" className="mt-1">
          Acompanhe suas finanças e metas deste mês.
        </Typography>
      </header>

      {/* Grid de Cards de Resumo */}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Resumo Financeiro
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <Suspense fallback={<SummaryCardSkeleton />}>
            <SummaryCard title="Saldo Atual" amount={12450.0} type="balance" />
          </Suspense>
          <Suspense fallback={<SummaryCardSkeleton />}>
            <SummaryCard title="Receitas (Mês)" amount={15000.0} type="income" />
          </Suspense>
          <Suspense fallback={<SummaryCardSkeleton />}>
            <SummaryCard title="Despesas (Mês)" amount={2550.0} type="expense" />
          </Suspense>
        </div>
      </section>

      {/* Alocação Padrão dos Gráficos */}
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
              <LazyCashFlowChart data={mockCashFlowData} />
            </Suspense>
          </div>
        </article>

        <article className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[24rem] flex flex-col">
          <Typography variant="h3" className="mb-6">
            Despesas por Categoria
          </Typography>
          <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-lg border border-slate-100 border-dashed relative">
             <Skeleton width="w-48" height="h-48" rounded="full" className="opacity-50" />
          </div>
        </article>
      </section>
    </div>
  );
}
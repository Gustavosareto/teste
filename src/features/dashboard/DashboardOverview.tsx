import React, { Suspense, useState } from 'react';
import { PageMetadata } from '../../components/seo/PageMetadata';
import { Typography } from '../../components/ui/Typography';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import {
  getExpenseCategoryPercentages,
  getFinancialSummary,
} from '../finance/selectors';
import { useCashFlow, useExpenses, useBills } from '../finance/api/queries';
import { ExpenseBreakdownList } from './components/ExpenseBreakdownList';
import { ExpenseDonutChart } from './components/ExpenseDonutChart';
import { SummaryCard } from './components/SummaryCard';
import { TransactionForm } from './components/TransactionForm';
import { FinancialInsight } from './components/FinancialInsight';
import { TransactionHistory } from './components/TransactionHistory';
import { ImportTransactions } from '../../components/ui/ImportTransactions';

const LazyCashFlowChart = React.lazy(() => import('./components/CashFlowChart').then((module) => ({ default: module.CashFlowChart })));

function SummaryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 flex flex-col gap-4">
      <Skeleton width="w-24" height="h-3" rounded="sm" />
      <Skeleton width="w-40" height="h-8" rounded="md" />
    </div>
  );
}

export function DashboardOverview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<'7-dias' | '30-di' | 'mes-passado' | 'este-ano'>('30-di');
  const { data: cashFlow, isPending: isCashFlowPending } = useCashFlow(periodFilter);
  const { data: expenses, isPending: isExpensesPending } = useExpenses(periodFilter);
  const { data: bills } = useBills();

  const summary = cashFlow ? getFinancialSummary(cashFlow) : { currentBalance: 0, totalIncome: 0, totalExpense: 0 };
  const adjustedSummary = {
    currentBalance: summary.currentBalance,
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
  };

  const categoryBreakdown = expenses ? getExpenseCategoryPercentages(expenses) : [];

  // Dados para Projeção (Mock simples baseado nas contas a pagar)
  const totalBillsAmount = (bills?.reduce((sum, bill) => sum + bill.amount, 0) || 0);
  const projectedBalance = adjustedSummary.currentBalance - totalBillsAmount;

  return (
    <div className="space-y-8">
      <PageMetadata title="Dashboard - MyFinance Pro" description="Visão geral do seu patrimônio e controle das suas finanças." />
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Typography variant="h1">Visão Geral</Typography>
          <Typography variant="body" color="muted" className="mt-1 text-sm">
            Acompanhe o desempenho do seu patrimônio e receba insights inteligentes.
          </Typography>
          
          <div className="mt-4 flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg w-max overflow-x-auto max-w-full">
            {(['7-dias', '30-di', 'mes-passado', 'este-ano'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  periodFilter === p 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-md dark:shadow-black/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {p === '7-dias' ? '7 Dias' : p === '30-di' ? '30 Dias' : p === 'mes-passado' ? 'Mês Passado' : 'Anual'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform active:scale-95"
          >
            <svg className="-ml-1 mr-2 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md dark:shadow-black/20 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 focus:ring-offset-2 sm:w-auto transition-all transform active:scale-95"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Registrar Movimentação
          </button>
        </div>
      </header>

      {/* Seção de Inteligência e Insights */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FinancialInsight 
          type="positive"
          title="Economia em Lazer"
          description="Este mês você gastou 15% a menos em lazer do que no mês passado. Bom trabalho!"
          impact={15}
        />
        <FinancialInsight 
          type="negative"
          title="Atenção: Contas a Vencer"
          description={`Você tem R$ ${totalBillsAmount.toLocaleString('pt-BR')} em contas previstas para os próximos 30 dias.`}
        />
        <FinancialInsight 
          type="neutral"
          title="Projeção de Saldo"
          description={`Considerando suas contas fixas, seu saldo projetado para o fim do mês é R$ ${projectedBalance.toLocaleString('pt-BR')}.`}
        />
      </section>

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
                <SummaryCard title="Saldo Atual" amount={adjustedSummary.currentBalance} tone="balance" />
              </Suspense>
              <Suspense fallback={<SummaryCardSkeleton />}>
                <SummaryCard 
                  title={periodFilter === 'este-ano' ? 'Receitas (Ano)' : periodFilter === 'mes-passado' ? 'Receitas (Mês Passado)' : 'Receitas (Mês)'} 
                  amount={adjustedSummary.totalIncome} 
                  tone="income" 
                />
              </Suspense>
              <Suspense fallback={<SummaryCardSkeleton />}>
                <SummaryCard 
                  title={periodFilter === 'este-ano' ? 'Despesas (Ano)' : periodFilter === 'mes-passado' ? 'Despesas (Mês Passado)' : 'Despesas (Mês)'} 
                  amount={adjustedSummary.totalExpense} 
                  tone="expense" 
                />
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

        <article className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 min-h-[24rem] flex flex-col relative overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between mb-8">
            <div>
               <Typography variant="h3">Fluxo de Caixa & Projeção</Typography>
               <Typography variant="label" color="muted">Demonstrativo de entradas, saídas e tendência</Typography>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Entradas</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-50 dark:bg-red-900/300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Saídas</span>
               </div>
            </div>
          </div>
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
          
          {/* Badge de Projeção no Gráfico */}
          <div className="absolute right-6 top-24 bg-slate-900 text-white p-3 rounded-2xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-right-4 duration-500">
             <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tendência Próximo Mês</span>
             <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium opacity-60">R$</span>
                <span className="text-lg font-bold">{(summary.currentBalance * 1.05).toLocaleString('pt-BR')}</span>
             </div>
             <span className="text-[10px] text-emerald-400 font-medium">+5.2% projetado</span>
          </div>
        </article>

        <article className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 min-h-[24rem] flex flex-col transition-colors duration-200">
          <Typography variant="h3" className="mb-1">Distribuição de Gastos</Typography>
          <Typography variant="label" color="muted" className="mb-6">Onde seu dinheiro está indo este mês</Typography>
          
          <div className="flex-1 flex flex-col gap-6">
            {!isExpensesPending && expenses && (
              <div className="flex-shrink-0">
                 <ExpenseDonutChart data={expenses} />
              </div>
            )}
            
            <div className="flex-1 rounded-2xl border border-slate-100 dark:border-slate-700 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50/30 dark:bg-slate-800/20 p-5">
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
          </div>
        </article>
      </section>

      {/* Extrato Recente */}
      <section className="bg-slate-50 dark:bg-slate-800/50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl border shadow-md dark:shadow-black/20 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-900 text-white rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
             </div>
             <div>
                <Typography variant="h3">Movimentações Recentes</Typography>
                <Typography variant="caption" color="muted">Suas últimas atividades financeiras</Typography>
             </div>
          </div>
          <button onClick={() => setIsHistoryModalOpen(true)} className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-slate-600 transition-colors uppercase tracking-widest flex items-center gap-2">
            Ver Extrato Completo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <TransactionHistory />
      </section>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Extrato Completo"
      >
        <div className="min-h-[50vh]">
            <TransactionHistory isFullView />
        </div>
      </Modal>

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

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importar Dados"
      >
        <ImportTransactions 
          onSuccess={() => setIsImportModalOpen(false)} 
          onClose={() => setIsImportModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}

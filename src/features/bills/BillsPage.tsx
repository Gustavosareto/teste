import { useState } from 'react';
import { PageMetadata } from '../../components/seo/PageMetadata';
import { CurrencyFormat } from '../../components/ui/CurrencyFormat';
import { Typography } from '../../components/ui/Typography';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { getPendingBillsAmount } from '../finance/selectors';
import { useBills, useDeleteBill } from '../finance/api/queries';
import { BillsCalendar } from './components/BillsCalendar';
import { BillForm } from './components/BillForm';
import { RecurringBill } from '../finance/types';

const billTypeLabels = {
  boleto: 'Boleto',
  assinatura: 'Assinatura',
};

const billStatusClasses = {
  pendente: 'bg-amber-100 text-amber-800 border-amber-200',
  pago: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const billStatusLabels = {
  pendente: 'Pendente',
  pago: 'Pago',
};

export function BillsPage() {
  const { data: bills, isPending, isError, error } = useBills();
  const { mutate: deleteBill } = useDeleteBill();
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<RecurringBill | undefined>(undefined);

  const pendingAmount = bills ? getPendingBillsAmount(bills) : 0;

  const displayedBills = bills?.filter((bill) => {
    if (selectedDay === null) return true;
    return bill.dueDay === selectedDay;
  }).sort((a, b) => a.dueDay - b.dueDay) || [];

  const handleOpenModal = (bill?: RecurringBill) => {
    setBillToEdit(bill);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBillToEdit(undefined);
  };

  return (
    <section className="space-y-8" aria-labelledby="bills-heading">
      <PageMetadata
        title="Boletos e assinaturas | MyFinance Pro"
        description="Gerencie boletos e assinaturas em aberto, acompanhe vencimentos no calendário."
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h1" id="bills-heading">
            Boletos e Assinaturas
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Mantenha previsibilidade no fluxo de caixa com o calendário de vencimentos.
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
          Nova Despesa
        </button>
      </header>

      {isError && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200" role="alert">
          <strong>Erro ao carregar boletos:</strong> {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Calendário */}
        <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8">
          {isPending ? (
            <Skeleton width="w-full" height="h-[400px]" rounded="xl" />
          ) : (
             <BillsCalendar 
               bills={bills || []} 
               selectedDay={selectedDay} 
               onSelectDay={setSelectedDay} 
             />
          )}

          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 p-5 shadow-sm">
            <Typography variant="label" className="text-amber-800">
              Total pendente no mês
            </Typography>
            {isPending ? (
              <Skeleton width="w-32" height="h-8" className="mt-2" rounded="md" />
            ) : (
              <Typography variant="h2" as="p" className="mt-2 text-amber-900">
                <CurrencyFormat value={pendingAmount} />
              </Typography>
            )}
          </div>
        </aside>

        {/* Lado Direito: Lista de Boletos */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4" aria-live="polite">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <Typography variant="h3">
              {selectedDay ? `Vencimentos dia ${selectedDay}` : 'Todos os Vencimentos'}
            </Typography>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {displayedBills.length} ite{displayedBills.length === 1 ? 'm' : 'ns'}
            </span>
          </div>

          {isPending && (
            <div className="space-y-4">
              <Skeleton width="w-full" height="h-24" rounded="xl" />
              <Skeleton width="w-full" height="h-24" rounded="xl" />
            </div>
          )}

          {!isPending && !isError && displayedBills.length === 0 && (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center gap-4">
              <Typography variant="body" color="muted">
                Nenhum vencimento {selectedDay ? `para o dia ${selectedDay}` : 'encontrado'}.
              </Typography>
              {!selectedDay && (
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="text-sm font-medium text-slate-900 underline hover:text-slate-700"
                >
                  Adicionar primeira despesa
                </button>
              )}
            </div>
          )}

          {!isPending && !isError && displayedBills.map((bill) => (
            <article 
              key={bill.id} 
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-default relative"
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleOpenModal(bill)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 bg-white rounded-md border border-slate-200 shadow-sm hover:bg-slate-50 relative z-10"
                  title="Editar despesa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
                      deleteBill(bill.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 bg-white rounded-md border border-slate-200 shadow-sm hover:bg-red-50 relative z-10"
                  title="Remover despesa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-4 pr-16">
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-slate-900 transition-colors">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {bill.type === 'boleto' 
                      ? <path d="M4 6h16M4 10h16M4 14h16M4 18h16" /> 
                      : <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />}
                  </svg>
                </div>
                <div>
                  <Typography variant="h4" as="h2" className="text-slate-900">
                    {bill.name}
                  </Typography>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span className="capitalize">{billTypeLabels[bill.type]}</span>
                    &bull;
                    <span>Vence dia {bill.dueDay}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t border-slate-100 sm:border-0 pt-4 sm:pt-0 mt-4 sm:mt-0">
                <Typography variant="h3" as="p" className="text-slate-900">
                  <CurrencyFormat value={bill.amount} />
                </Typography>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${billStatusClasses[bill.status]}`}>
                  {billStatusLabels[bill.status]}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={billToEdit ? "Editar Despesa" : "Nova Despesa (Boleto/Assinatura)"}
        >
          <BillForm 
            initialData={billToEdit}
            onSuccess={handleCloseModal} 
            onCancel={handleCloseModal} 
          />
        </Modal>
      )}
    </section>
  );
}

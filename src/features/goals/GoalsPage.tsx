import { useState } from 'react';
import { PageMetadata } from '../../components/seo/PageMetadata';
import { Typography } from '../../components/ui/Typography';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { useGoals } from '../finance/api/queries';
import { GoalCard } from './components/GoalCard';
import { GoalForm } from './components/GoalForm';
import { CompoundInterestSimulator } from './components/CompoundInterestSimulator';
import { FinancialGoal } from '../finance/types';

function GoalCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 flex flex-col gap-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton width="w-32" height="h-4" rounded="sm" />
          <Skeleton width="w-24" height="h-3" rounded="sm" />
        </div>
        <Skeleton width="w-16" height="h-5" rounded="full" />
      </div>
      <div className="space-y-2">
        <Skeleton width="w-full" height="h-2" rounded="full" />
      </div>
      <div className="flex justify-between pt-2">
        <div className="space-y-1">
          <Skeleton width="w-10" height="h-2" rounded="sm" />
          <Skeleton width="w-20" height="h-6" rounded="sm" />
        </div>
        <div className="space-y-1">
          <Skeleton width="w-10" height="h-2" rounded="sm" />
          <Skeleton width="w-16" height="h-4" rounded="sm" />
        </div>
      </div>
    </div>
  );
}

export function GoalsPage() {
  const { data: goals, isPending, isError, error } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | undefined>(undefined);

  const handleOpenModal = (goal?: FinancialGoal) => {
    setGoalToEdit(goal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGoalToEdit(undefined);
  };

  return (
    <div className="space-y-8">
      <PageMetadata
        title="Metas financeiras e progresso | MyFinance Pro"
        description="Acompanhe suas metas financeiras com percentual de progresso, valor restante e prazo final de cada objetivo."
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h1">Metas Financeiras</Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Gerencie e acompanhe o progresso dos seus objetivos de curto, médio e longo prazo.
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
          Adicionar Meta
        </button>
      </header>

      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200" role="alert">
          Erro ao carregar metas: {error.message}
        </div>
      )}

      <section aria-labelledby="goals-list-heading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <h2 id="goals-list-heading" className="sr-only">
          Lista de Metas Ativas
        </h2>

        {isPending ? (
          <>
            <GoalCardSkeleton />
            <GoalCardSkeleton />
            <GoalCardSkeleton />
          </>
        ) : (
          goals?.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={handleOpenModal} />
          ))
        )}
      </section>

      {!isPending && !isError && goals?.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/50/30 flex flex-col items-center justify-center gap-4">
          <Typography variant="body" color="muted">
            Você ainda não possui nenhuma meta financeira cadastrada.
          </Typography>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="text-sm font-medium text-slate-900 dark:text-slate-100 underline hover:text-slate-700 dark:text-slate-300"
          >
            Criar primeira meta
          </button>
        </div>
      )}

      {/* Simulador de Juros e Gamificação */}
      <section className="pt-6">
        <CompoundInterestSimulator />
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={goalToEdit ? "Editar Meta Financeira" : "Nova Meta Financeira"}
      >
        <GoalForm 
          initialData={goalToEdit}
          onSuccess={handleCloseModal} 
          onCancel={handleCloseModal} 
        />
      </Modal>
    </div>
  );
}

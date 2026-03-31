import { Typography } from '../../../components/ui/Typography';
import { FinancialGoal } from '../../finance/types';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { useDeleteGoal } from '../../finance/api/queries';
import { useState } from 'react';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit: (goal: FinancialGoal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoal();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const statusColors = {
    'em-dia': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'atrasada': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'concluida': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };

  const statusLabels = {
    'em-dia': 'Em dia',
    'atrasada': 'Atrasada',
    'concluida': 'Concluída',
  };

  return (
    <article className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 flex flex-col gap-4 relative group ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(goal)}
          className="p-1.5 text-slate-400 hover:text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 hover:bg-slate-50 dark:bg-slate-800/50 relative z-10"
          title="Editar meta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirmOpen(true);
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-black/20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative z-10"
          title="Excluir meta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex justify-between items-start pt-1">
        <header className="pr-16">
          <Typography variant="h3" className="text-lg truncate">{goal.title}</Typography>
          <Typography variant="body" color="muted" className="text-sm">
            Meta: <CurrencyFormat value={goal.targetAmount} />
          </Typography>
        </header>
        <span 
          className={`px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium border ${statusColors[goal.status]}`}
          role="status"
        >
          {statusLabels[goal.status]}
        </span>
      </div>

      <div className="space-y-4 my-2">
        <div 
          className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" 
          role="progressbar" 
          aria-valuenow={percentage} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <div 
            className={`h-full transition-all duration-1000 rounded-full relative ${goal.status === 'atrasada' ? 'bg-amber-500' : 'bg-emerald-500 bg-stripes'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
           <Typography variant="body" className="text-sm leading-relaxed">
             {percentage < 100 ? (
               <>
                 Faltam <span className="font-semibold text-slate-800 dark:text-slate-200"><CurrencyFormat value={goal.targetAmount - goal.currentAmount} /></span> para sua meta. 
                 Você já percorreu <span className="font-semibold text-emerald-600">{percentage}%</span> do caminho. Continue assim!
               </>
             ) : (
               <span className="font-semibold text-emerald-600">Parabéns! Você alcançou esta meta!</span>
             )}
           </Typography>
        </div>
      </div>

      <footer className="pt-2 flex justify-between items-end border-t border-slate-100 dark:border-slate-700 mt-auto">
        <div>
          <Typography variant="body" color="muted" className="text-xs uppercase tracking-wider font-semibold">Atual</Typography>
          <Typography variant="h3" className="text-xl">
            <CurrencyFormat value={goal.currentAmount} />
          </Typography>
        </div>
        <div className="text-right">
          <Typography variant="body" color="muted" className="text-xs">Prazo</Typography>
          <Typography variant="body" className="font-medium text-sm">
            {new Date(goal.deadline).toLocaleDateString('pt-BR')}
          </Typography>
        </div>
      </footer>
      
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Excluir Meta"
        message="Tem certeza que deseja excluir esta meta financeira? Todas as informações vinculadas poderão ser perdidas e não poderão ser recuperadas."
        confirmText="Excluir"
        isDestructive={true}
        onConfirm={() => {
          deleteGoal(goal.id);
          setIsConfirmOpen(false);
        }}
      />
    </article>
  );
}

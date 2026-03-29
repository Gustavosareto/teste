import { Typography } from '../../../components/ui/Typography';
import { FinancialGoal } from '../../finance/types';
import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { useDeleteGoal } from '../../finance/api/queries';

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit: (goal: FinancialGoal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoal();
  
  const statusColors = {
    'em-dia': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'atrasada': 'bg-amber-100 text-amber-800 border-amber-200',
    'concluida': 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const statusLabels = {
    'em-dia': 'Em dia',
    'atrasada': 'Atrasada',
    'concluida': 'Concluída',
  };

  return (
    <article className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 relative group ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(goal)}
          className="p-1.5 text-slate-400 hover:text-slate-900 bg-white rounded-md border border-slate-200 shadow-sm hover:bg-slate-50 relative z-10"
          title="Editar meta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Tem certeza que deseja excluir esta meta?')) {
              deleteGoal(goal.id);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 bg-white rounded-md border border-slate-200 shadow-sm hover:bg-red-50 relative z-10"
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

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <Typography variant="body" color="muted">Progresso</Typography>
          <Typography variant="body" className="font-medium">{percentage}%</Typography>
        </div>
        <div 
          className="h-2 w-full bg-slate-100 rounded-full overflow-hidden" 
          role="progressbar" 
          aria-valuenow={percentage} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <div 
            className={`h-full transition-all duration-500 rounded-full ${goal.status === 'atrasada' ? 'bg-amber-500' : 'bg-emerald-600'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <footer className="pt-2 flex justify-between items-end border-t border-slate-50 mt-auto">
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
    </article>
  );
}

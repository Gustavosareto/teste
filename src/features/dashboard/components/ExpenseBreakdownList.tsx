import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';

interface ExpenseCategoryWithPercentage {
  category: string;
  amount: number;
  color: string;
  percentage: number;
  budgetLimit?: number;
}

interface ExpenseBreakdownListProps {
  categories: ExpenseCategoryWithPercentage[];
}

export function ExpenseBreakdownList({ categories }: ExpenseBreakdownListProps) {
  return (
    <ul className="space-y-5" aria-label="Distribuicao de despesas por categoria">
      {categories.map((category) => {
        const hasBudget = category.budgetLimit !== undefined;
        // Se tiver teto de gastos, a barra mostra o progresso do orçamento, caso contrário mostra o % total.
        const budgetPercentage = hasBudget ? Math.min((category.amount / category.budgetLimit!) * 100, 100) : category.percentage;
        const isOverBudget = hasBudget && category.amount > category.budgetLimit!;
        
        return (
          <li key={category.category} className="space-y-2 relative">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full shadow-md dark:shadow-black/20"
                  style={{ backgroundColor: isOverBudget ? '#ef4444' : category.color }}
                  aria-hidden="true"
                />
                <Typography variant="body" className="text-sm font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200" as="span">
                  {category.category}
                </Typography>
                {isOverBudget && (
                  <svg className="w-4 h-4 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <title>Teto de gastos ultrapassado</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="text-right">
                <Typography variant="body" className="text-sm font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100" as="span">
                   <CurrencyFormat value={category.amount} type="expense" />
                </Typography>
              </div>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-50 dark:bg-red-900/300' : ''}`}
                style={{ 
                  width: `${budgetPercentage}%`, 
                  backgroundColor: isOverBudget ? undefined : category.color 
                }}
                aria-hidden="true"
              />
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-wide">
               <span className="text-slate-400">
                 {hasBudget ? 'Orçamento' : 'Proporção'}
               </span>
               {hasBudget ? (
                 <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-slate-500'}>
                   <CurrencyFormat value={category.budgetLimit!} showSymbol={false} /> teto
                 </span>
               ) : (
                 <span className="text-slate-500">{category.percentage.toFixed(1)}% do total</span>
               )}
            </div>
          </li>
        )
      })}
    </ul>
  );
}

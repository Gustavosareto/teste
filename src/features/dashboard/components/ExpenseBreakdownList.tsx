import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';

interface ExpenseCategoryWithPercentage {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

interface ExpenseBreakdownListProps {
  categories: ExpenseCategoryWithPercentage[];
}

export function ExpenseBreakdownList({ categories }: ExpenseBreakdownListProps) {
  return (
    <ul className="space-y-4" aria-label="Distribuicao de despesas por categoria">
      {categories.map((category) => (
        <li key={category.category} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <Typography variant="caption" color="secondary" as="span">
                {category.category}
              </Typography>
            </div>
            <Typography variant="caption" color="secondary" as="span">
              {category.percentage.toFixed(1)}%
            </Typography>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
            <div
              className="h-full rounded"
              style={{ width: `${category.percentage}%`, backgroundColor: category.color }}
              aria-hidden="true"
            />
          </div>
          <Typography variant="caption" color="muted">
            <CurrencyFormat value={category.amount} />
          </Typography>
        </li>
      ))}
    </ul>
  );
}

import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';

type SummaryCardTone = 'income' | 'expense' | 'balance';

interface SummaryCardProps {
  title: string;
  amount: number;
  tone: SummaryCardTone;
}

const toneClasses: Record<SummaryCardTone, string> = {
  income: 'text-emerald-700 dark:text-emerald-400',
  expense: 'text-red-700 dark:text-red-400 dark:text-red-400',
  balance: 'text-slate-900 dark:text-slate-100 dark:text-slate-50',
};

export function SummaryCard({ title, amount, tone }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md dark:shadow-black/20 transition-colors duration-200">
      <Typography variant="label" color="muted">
        {title}
      </Typography>
      <Typography variant="h2" as="p" className={`mt-3 ${toneClasses[tone]}`}>
        <CurrencyFormat value={amount} type={tone === 'balance' ? 'neutral' : tone} />
      </Typography>
    </article>
  );
}

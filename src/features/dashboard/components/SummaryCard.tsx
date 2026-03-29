import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';

type SummaryCardTone = 'income' | 'expense' | 'balance';

interface SummaryCardProps {
  title: string;
  amount: number;
  tone: SummaryCardTone;
}

const toneClasses: Record<SummaryCardTone, string> = {
  income: 'text-emerald-700',
  expense: 'text-red-700',
  balance: 'text-slate-900',
};

export function SummaryCard({ title, amount, tone }: SummaryCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <Typography variant="label" color="muted">
        {title}
      </Typography>
      <Typography variant="h2" as="p" className={`mt-3 ${toneClasses[tone]}`}>
        <CurrencyFormat value={amount} />
      </Typography>
    </article>
  );
}

import { CurrencyFormat } from '../../../components/ui/CurrencyFormat';
import { Typography } from '../../../components/ui/Typography';
import { MoveUpRight, MoveDownRight, Wallet } from 'lucide-react';

type SummaryCardTone = 'income' | 'expense' | 'balance';

interface SummaryCardProps {
  title: string;
  amount: number;
  tone: SummaryCardTone;
}

const toneClasses: Record<SummaryCardTone, string> = {
  income: 'text-emerald-600 dark:text-emerald-400',
  expense: 'text-rose-600 dark:text-rose-400',
  balance: 'text-slate-900 dark:text-white',
};

const toneIcons: Record<SummaryCardTone, React.ReactNode> = {
  income: <MoveUpRight className="w-5 h-5" />,
  expense: <MoveDownRight className="w-5 h-5" />,
  balance: <Wallet className="w-5 h-5" />,
};

const toneIconBgClasses: Record<SummaryCardTone, string> = {
  income: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  expense: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
  balance: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
};

export function SummaryCard({ title, amount, tone }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <Typography variant="label" className="text-slate-500 dark:text-slate-400 font-medium">
          {title}
        </Typography>
        <div className={`p-2 rounded-xl transition-colors group-hover:scale-105 duration-200 ${toneIconBgClasses[tone]}`}>
          {toneIcons[tone]}
        </div>
      </div>
      <Typography variant="h2" as="p" className={`text-2xl md:text-3xl font-bold tracking-tight ${toneClasses[tone]}`}>
        <CurrencyFormat value={amount} type={tone === 'balance' ? 'neutral' : tone} />
      </Typography>
    </article>
  );
}

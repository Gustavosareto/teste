import { Typography } from "../../../components/ui/Typography";
import { TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

interface FinancialInsightProps {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact?: number;
}

export function FinancialInsight({ type, title, description, impact }: FinancialInsightProps) {
  const bgColor = {
    positive: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
    negative: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
    neutral: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20',
  }[type];

  const iconColor = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-indigo-600 dark:text-indigo-400',
  }[type];

  return (
    <div className={`p-4 rounded-2xl border ${bgColor} flex gap-4 items-start transition-all hover:shadow-md dark:shadow-black/20`}>
      <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${iconColor}`}>
        {type === 'positive' && <TrendingUp className="w-5 h-5" />}
        {type === 'negative' && <TrendingDown className="w-5 h-5" />}
        {type === 'neutral' && <Lightbulb className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <Typography variant="h4" className="text-slate-900 dark:text-slate-100 text-sm font-bold truncate mr-2 ml-0">{title}</Typography>
          {impact !== undefined && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${type === 'positive' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'}`}>
              {type === 'positive' ? '+' : '-'}{Math.abs(impact)}%
            </span>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
import { Typography } from "../../../components/ui/Typography";

interface FinancialInsightProps {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact?: number;
}

export function FinancialInsight({ type, title, description, impact }: FinancialInsightProps) {
  const bgColor = {
    positive: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
    negative: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',
    neutral: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
  }[type];

  const iconColor = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-blue-600 dark:text-blue-400',
  }[type];

  return (
    <div className={`p-4 rounded-2xl border ${bgColor} flex gap-4 items-start transition-all hover:shadow-md dark:shadow-black/20`}>
      <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 shadow-md dark:shadow-black/20 ${iconColor}`}>
        {type === 'positive' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
        {type === 'negative' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        )}
        {type === 'neutral' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <Typography variant="h4" className="text-slate-900 dark:text-slate-100 dark:text-slate-50 text-sm font-bold">{title}</Typography>
          {impact !== undefined && (
            <span className={`text-xs font-bold ${iconColor}`}>
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
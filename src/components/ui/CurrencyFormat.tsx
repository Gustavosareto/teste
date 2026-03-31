import { usePrivacyMode } from '../../providers/PrivacyProvider';

interface CurrencyFormatProps {
  value: number;
  currency?: string;
  locale?: string;
  className?: string;
  isObscured?: boolean;
  showSymbol?: boolean;
  type?: 'income' | 'expense' | 'neutral';
}

export function CurrencyFormat({
  value,
  currency = 'BRL',
  locale = 'pt-BR',
  className = '',
  isObscured = false,
  showSymbol = true,
  type = 'neutral',
}: CurrencyFormatProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const shouldObscure = isObscured || isPrivacyMode;

  const formattedValue = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);

  const finalValue = showSymbol
    ? formattedValue
    : formattedValue.replace(/^R\$\s?/, '').trim();

  const colorClass = 
    type === 'income' ? 'text-emerald-600 dark:text-emerald-400' :
    type === 'expense' ? 'text-red-600 dark:text-red-400' :
    '';

  return (
    <span className={`font-mono tabular-nums ${colorClass} ${className}`}>
      {shouldObscure ? '••••••' : finalValue}
    </span>
  );
}
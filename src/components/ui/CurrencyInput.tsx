import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface CurrencyInputProps extends Omit<NumericFormatProps, 'value' | 'onValueChange' | 'onChange'> {
  value?: number;
  onChange?: (value: number | undefined) => void;
  id?: string;
  name?: string;
  error?: boolean;
}

export function CurrencyInput({ value, onChange, id, name, error, className = '', ...props }: CurrencyInputProps) {
  const baseClasses = "w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 sm:text-sm transition-colors";
  const stateClasses = error 
    ? "border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900 bg-red-50 dark:bg-red-900/30/50" 
    : "border-slate-300 dark:border-slate-700 focus:ring-slate-900 focus:border-slate-900";

  return (
    <div className="relative">
      <span className={`absolute left-3 top-2 text-sm ${error ? 'text-red-500' : 'text-slate-500'}`}>
        R$
      </span>
      <NumericFormat
        id={id}
        name={name}
        value={value}
        onValueChange={(values) => {
          onChange?.(values.floatValue);
        }}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale={true}
        allowNegative={false}
        placeholder="0,00"
        className={`${baseClasses} ${stateClasses} ${className}`}
        {...props}
      />
    </div>
  );
}

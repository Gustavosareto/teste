import React from 'react';

interface CurrencyFormatProps {
  value: number;
  currency?: string;
  locale?: string;
  className?: string;
  isObscured?: boolean; // Preparado para a possível feature de "ocultar saldo"
}

export function CurrencyFormat({
  value,
  currency = 'BRL',
  locale = 'pt-BR',
  className = '',
  isObscured = false,
}: CurrencyFormatProps) {
  const formattedValue = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {isObscured ? 'R$ •••••' : formattedValue}
    </span>
  );
}
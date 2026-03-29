import React from 'react';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
type ColorVariant = 'primary' | 'secondary' | 'muted' | 'error' | 'success';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: ColorVariant;
  as?: React.ElementType;
  className?: string;
  id?: string;
  children: React.ReactNode;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-xl font-medium tracking-tight',
  h4: 'text-lg font-medium',
  body: 'text-base',
  caption: 'text-sm',
  label: 'text-xs font-semibold uppercase tracking-wider',
};

const colorStyles: Record<ColorVariant, string> = {
  primary: 'text-slate-900',
  secondary: 'text-slate-700',
  muted: 'text-slate-500',
  error: 'text-red-600',
  success: 'text-emerald-600',
};

const defaultElements: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  caption: 'span',
  label: 'span',
};

export function Typography({
  variant = 'body',
  color = 'primary',
  as,
  className = '',
  id,
  children,
}: TypographyProps) {
  const Component = as || defaultElements[variant];
  const combinedClasses = `${variantStyles[variant]} ${colorStyles[color]} ${className}`.trim();

  return <Component id={id} className={combinedClasses}>{children}</Component>;
}
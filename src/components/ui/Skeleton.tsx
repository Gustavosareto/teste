import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({ 
  className = '', 
  width = 'w-full', 
  height = 'h-full',
  rounded = 'md'
}: SkeletonProps) {
  const roundedClass = `rounded-${rounded}`;
  
  return (
    <div 
      className={`animate-pulse bg-slate-200 ${width} ${height} ${roundedClass} ${className}`}
      aria-hidden="true"
    />
  );
}
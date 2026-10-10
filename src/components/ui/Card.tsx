import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 transition-all duration-200',
        glass ? 'glass-card' : 'bg-slate-900 border border-slate-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

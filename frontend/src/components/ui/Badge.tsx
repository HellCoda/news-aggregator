import React, { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-background-hover text-text-primary border border-border-primary',
        primary: 'bg-accent-primary text-text-primary',
        secondary: 'bg-background-secondary text-text-secondary',
        success: 'bg-state-success/20 text-state-success border border-state-success/30',
        error: 'bg-state-error/20 text-state-error border border-state-error/30',
        warning: 'bg-state-warning/20 text-state-warning border border-state-warning/30',
        info: 'bg-state-info/20 text-state-info border border-state-info/30',
        // Catégories
        actualites: 'bg-category-actualites/20 text-category-actualites border border-category-actualites/30',
        technologie: 'bg-category-technologie/20 text-category-technologie border border-category-technologie/30',
        sport: 'bg-category-sport/20 text-category-sport border border-category-sport/30',
        culture: 'bg-category-culture/20 text-category-culture border border-category-culture/30',
        science: 'bg-category-science/20 text-category-science border border-category-science/30',
      },
      size: {
        sm: 'text-xs px-2 py-0.5 rounded-md',
        md: 'text-sm px-2.5 py-1 rounded-md',
        lg: 'text-base px-3 py-1.5 rounded-lg',
      },
      interactive: {
        true: 'cursor-pointer hover:opacity-80',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  interactive,
  leftIcon,
  rightIcon,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(badgeVariants({ variant, size, interactive, className }))}
      {...props}
    >
      {leftIcon && <span className="mr-1">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-1">{rightIcon}</span>}
    </span>
  );
};
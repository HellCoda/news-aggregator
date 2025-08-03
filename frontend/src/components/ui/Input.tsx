import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'w-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: [
          'bg-background-secondary text-text-primary placeholder-text-tertiary',
          'border border-border-primary rounded-input',
          'hover:border-border-secondary',
          'focus:border-accent-primary focus:ring-accent-primary/20',
        ],
        outlined: [
          'bg-transparent text-text-primary placeholder-text-tertiary',
          'border-2 border-border-primary rounded-input',
          'hover:border-accent-primary',
          'focus:border-accent-primary focus:ring-accent-primary/20',
        ],
        filled: [
          'bg-background-hover text-text-primary placeholder-text-tertiary',
          'border border-transparent rounded-input',
          'hover:bg-background-secondary',
          'focus:bg-background-secondary focus:border-accent-primary focus:ring-accent-primary/20',
        ],
        glass: [
          'glass-light dark:glass-dark text-text-primary placeholder-text-tertiary',
          'border border-transparent rounded-input',
          'focus:border-accent-primary focus:ring-accent-primary/20',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        xl: 'h-14 px-6 text-lg',
      },
      error: {
        true: 'border-state-error focus:border-state-error focus:ring-state-error/20',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      error: false,
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      error,
      leftIcon,
      rightIcon,
      label,
      helperText,
      errorMessage,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || !!errorMessage;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, error: hasError, className }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helperText || errorMessage) && (
          <p
            className={cn(
              'mt-2 text-xs',
              hasError ? 'text-state-error' : 'text-text-tertiary'
            )}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
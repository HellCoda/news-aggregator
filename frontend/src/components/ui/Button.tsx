import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: [
          'bg-accent-primary text-text-primary',
          'hover:bg-accent-hover hover:shadow-button-hover',
          'focus:ring-accent-primary',
        ],
        secondary: [
          'bg-background-secondary text-text-primary border border-border-primary',
          'hover:bg-background-hover hover:border-border-secondary',
          'focus:ring-border-primary',
        ],
        ghost: [
          'bg-transparent text-text-secondary',
          'hover:bg-background-hover hover:text-text-primary',
          'focus:ring-border-primary',
        ],
        danger: [
          'bg-state-error text-white',
          'hover:opacity-90 hover:shadow-button-hover',
          'focus:ring-state-error',
        ],
        success: [
          'bg-state-success text-white',
          'hover:opacity-90 hover:shadow-button-hover',
          'focus:ring-state-success',
        ],
        glass: [
          'glass-light dark:glass-dark text-text-primary',
          'hover:bg-opacity-90 hover:shadow-glass',
          'focus:ring-accent-primary',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-button',
        lg: 'h-12 px-6 text-base rounded-button',
        xl: 'h-14 px-8 text-lg rounded-button',
        icon: 'h-10 w-10 rounded-button',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="mr-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            Chargement...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
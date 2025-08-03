import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = true,
}) => {
  const variantClasses = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-background-secondary to-background-hover',
        variantClasses[variant],
        animation && 'animate-pulse',
        className
      )}
      style={{
        width: width || '100%',
        height: height || '20px',
      }}
    />
  );
};

// Composants Skeleton prédéfinis
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="16px"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-background-card rounded-card p-6 space-y-4', className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height="20px" width="50%" />
          <Skeleton variant="text" height="16px" width="30%" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex space-x-2">
        <Skeleton variant="rounded" height="32px" width="80px" />
        <Skeleton variant="rounded" height="32px" width="80px" />
      </div>
    </div>
  );
};

export const SkeletonArticle: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-background-card rounded-card overflow-hidden', className)}>
      <Skeleton variant="rectangular" height="200px" />
      <div className="p-6 space-y-4">
        <Skeleton variant="text" height="24px" width="90%" />
        <SkeletonText lines={2} />
        <div className="flex items-center justify-between">
          <Skeleton variant="rounded" height="24px" width="100px" />
          <Skeleton variant="text" height="16px" width="120px" />
        </div>
      </div>
    </div>
  );
};
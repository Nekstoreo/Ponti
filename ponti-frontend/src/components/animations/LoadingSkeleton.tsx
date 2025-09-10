"use client";

import { ReactNode } from "react";

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'list' | 'schedule' | 'map' | 'notification';
  count?: number;
  animated?: boolean;
}

export default function LoadingSkeleton({
  className = "",
  variant = 'default',
  count = 1,
  animated = true
}: LoadingSkeletonProps) {
  const baseClasses = `
    bg-gradient-to-r from-muted via-muted/50 to-muted
    ${animated ? 'animate-pulse' : ''}
    rounded-md
  `;

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className={`h-4 w-3/4 ${baseClasses}`} />
            <div className={`h-3 w-full ${baseClasses}`} />
            <div className={`h-3 w-2/3 ${baseClasses}`} />
            <div className="flex gap-2 mt-4">
              <div className={`h-8 w-20 ${baseClasses}`} />
              <div className={`h-8 w-16 ${baseClasses}`} />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3">
                <div className={`h-12 w-12 rounded-full ${baseClasses}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-3/4 ${baseClasses}`} />
                  <div className={`h-3 w-1/2 ${baseClasses}`} />
                </div>
                <div className={`h-8 w-8 rounded ${baseClasses}`} />
              </div>
            ))}
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            {/* Week header skeleton */}
            <div className="space-y-2">
              <div className={`h-4 w-32 ${baseClasses}`} />
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={`h-12 w-12 rounded-md ${baseClasses}`} />
                ))}
              </div>
            </div>
            
            {/* Timeline skeleton */}
            <div className="border rounded-md p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <div className={`h-4 w-12 ${baseClasses}`} />
                  <div className={`h-16 flex-1 rounded ${baseClasses}`} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="space-y-3">
            {/* Search bar skeleton */}
            <div className={`h-12 w-full rounded-lg ${baseClasses}`} />
            
            {/* Filter pills skeleton */}
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`h-8 w-20 rounded-full ${baseClasses}`} />
              ))}
            </div>
            
            {/* Map canvas skeleton */}
            <div className={`h-96 w-full rounded-md ${baseClasses} relative`}>
              {/* Simulate map pins */}
              <div className="absolute top-8 left-12 h-6 w-6 bg-primary/20 rounded-full" />
              <div className="absolute top-20 right-16 h-6 w-6 bg-primary/20 rounded-full" />
              <div className="absolute bottom-16 left-20 h-6 w-6 bg-primary/20 rounded-full" />
              <div className="absolute bottom-8 right-8 h-6 w-6 bg-primary/20 rounded-full" />
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border-l-4 border-muted rounded-lg">
                <div className={`h-10 w-10 rounded-lg ${baseClasses}`} />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className={`h-5 w-16 rounded-full ${baseClasses}`} />
                    <div className={`h-5 w-20 rounded-full ${baseClasses}`} />
                  </div>
                  <div className={`h-4 w-full ${baseClasses}`} />
                  <div className={`h-3 w-2/3 ${baseClasses}`} />
                  <div className={`h-3 w-24 ${baseClasses}`} />
                </div>
                <div className={`h-6 w-6 rounded ${baseClasses}`} />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className={`h-4 ${baseClasses} ${className}`} />
        );
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
}

// Specific skeleton components for reusability
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-4 w-32" />
      </div>

      {/* Next class card */}
      <LoadingSkeleton variant="card" />

      {/* Announcements */}
      <div className="space-y-3">
        <LoadingSkeleton className="h-6 w-36" />
        <LoadingSkeleton variant="list" count={3} />
      </div>
    </div>
  );
}

export function ScheduleSkeleton() {
  return <LoadingSkeleton variant="schedule" />;
}

export function MapSkeleton() {
  return <LoadingSkeleton variant="map" />;
}

export function NotificationsSkeleton() {
  return <LoadingSkeleton variant="notification" count={5} />;
}

// Loading spinner component
export function LoadingSpinner({
  size = 'md',
  className = "",
  label = "Cargando..."
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        animate-spin rounded-full 
        border-2 border-muted 
        border-t-primary
      `} />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

// Shimmering effect for enhanced loading states
export function ShimmerEffect({
  children,
  isLoading = false,
  className = ""
}: {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  );
}

// Progressive loading for images and content
export function ProgressiveLoad({
  children,
  isLoaded = false,
  skeleton,
  className = ""
}: {
  children: ReactNode;
  isLoaded?: boolean;
  skeleton?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          transition-opacity duration-300 ease-out
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {children}
      </div>
      
      {!isLoaded && (
        <div className="absolute inset-0">
          {skeleton || <LoadingSkeleton className="h-full w-full" />}
        </div>
      )}
    </div>
  );
}

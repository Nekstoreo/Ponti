"use client";

import { ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { useHaptics } from "@/hooks/useHaptics";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
  className?: string;
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
  className = ""
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);
  const [hasTriggeredThresholdHaptic, setHasTriggeredThresholdHaptic] = useState(false);
  const { hapticFeedback } = useHaptics();

  // Check if we can pull (at top of container)
  const checkCanPull = () => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollTop === 0;
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    if (checkCanPull()) {
      setCanPull(true);
      setStartY(e.touches[0].clientY);
      setIsPulling(false);
    }
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !canPull) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    // Only handle downward pulls
    if (deltaY > 0 && checkCanPull()) {
      e.preventDefault();
      
      if (!isPulling) {
        setIsPulling(true);
        hapticFeedback.pullToRefresh();
        setHasTriggeredThresholdHaptic(false);
      }
      
      // Apply resistance curve - makes pulling feel more natural
      const resistance = Math.max(0, 1 - (deltaY / (maxPullDistance * 2)));
      const adjustedDelta = deltaY * resistance;
      const newPullDistance = Math.min(adjustedDelta, maxPullDistance);
      
      // Trigger haptic feedback when threshold is reached
      if (newPullDistance >= threshold && !hasTriggeredThresholdHaptic) {
        hapticFeedback.success();
        setHasTriggeredThresholdHaptic(true);
      } else if (newPullDistance < threshold && hasTriggeredThresholdHaptic) {
        setHasTriggeredThresholdHaptic(false);
      }
      
      setPullDistance(newPullDistance);
    }
  };

  // Reset pull state
  const resetPull = useCallback(() => {
    setIsPulling(false);
    setCanPull(false);
    setPullDistance(0);
    setHasTriggeredThresholdHaptic(false);
  }, []);

  // Trigger refresh
  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPullDistance(threshold); // Keep at threshold position
    hapticFeedback.refreshComplete();
    
    try {
      await onRefresh();
      hapticFeedback.refreshComplete();
    } finally {
      resetPull();
      setIsRefreshing(false);
    }
  }, [onRefresh, threshold, hapticFeedback, resetPull]);

  // Handle touch end
  const handleTouchEnd = () => {
    if (disabled || isRefreshing || !isPulling) {
      resetPull();
      return;
    }

    if (pullDistance >= threshold) {
      triggerRefresh();
    } else {
      resetPull();
    }
  };

  // Mouse events for desktop support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isRefreshing) return;
    
    if (checkCanPull()) {
      setCanPull(true);
      setStartY(e.clientY);
      setIsPulling(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || isRefreshing || !canPull) return;

    const deltaY = e.clientY - startY;

    if (deltaY > 0 && checkCanPull()) {
      setIsPulling(true);
      const resistance = Math.max(0, 1 - (deltaY / (maxPullDistance * 2)));
      const adjustedDelta = deltaY * resistance;
      setPullDistance(Math.min(adjustedDelta, maxPullDistance));
    }
  };

  const handleMouseUp = () => {
    if (disabled || isRefreshing || !isPulling) {
      resetPull();
      return;
    }

    if (pullDistance >= threshold) {
      triggerRefresh();
    } else {
      resetPull();
    }
  };

  // Keyboard shortcut for refresh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && (e.metaKey || e.ctrlKey) && !isRefreshing && !disabled) {
        e.preventDefault();
        triggerRefresh();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRefreshing, disabled, triggerRefresh]);

  // Progress calculation
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = isPulling || isRefreshing;
  const hasReachedThreshold = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={isPulling ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Pull indicator */}
      <div
        className={`
          absolute top-0 left-0 right-0 z-10 flex items-center justify-center
          transition-all duration-200 ease-out
          ${shouldShowIndicator 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
          }
        `}
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? threshold : 0)}px`,
          transform: `translateY(${shouldShowIndicator ? 0 : -20}px)`
        }}
      >
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          {/* Spinner/Arrow icon */}
          <div className="relative">
            <div
              className={`
                w-6 h-6 transition-all duration-200 ease-out
                ${isRefreshing 
                  ? 'animate-spin' 
                  : hasReachedThreshold 
                    ? 'rotate-180' 
                    : 'rotate-0'
                }
              `}
            >
              {isRefreshing ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
            </div>
            
            {/* Progress ring */}
            {!isRefreshing && (
              <svg 
                className="absolute inset-0 w-6 h-6 -rotate-90" 
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 10}`}
                  strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress)}`}
                  strokeLinecap="round"
                  className="transition-all duration-100 ease-out"
                />
              </svg>
            )}
          </div>

          {/* Status text */}
          <span className="text-xs font-medium">
            {isRefreshing 
              ? 'Actualizando...' 
              : hasReachedThreshold 
                ? 'Suelta para actualizar' 
                : 'Desliza hacia abajo'
            }
          </span>
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${shouldShowIndicator ? pullDistance : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Simple refresh button for cases where pull-to-refresh isn't suitable
export function RefreshButton({
  onRefresh,
  isRefreshing = false,
  disabled = false,
  className = "",
  size = 'md'
}: {
  onRefresh: () => void;
  isRefreshing?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={onRefresh}
      disabled={disabled || isRefreshing}
      className={`
        ${sizeClasses[size]}
        rounded-full border bg-background 
        hover:bg-accent transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
      aria-label="Actualizar"
    >
      <svg 
        className={`
          ${iconSizes[size]} 
          ${isRefreshing ? 'animate-spin' : ''}
          transition-transform duration-200
        `} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );
}

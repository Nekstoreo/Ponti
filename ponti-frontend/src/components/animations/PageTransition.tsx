"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ 
  children, 
  className = "" 
}: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');

  useEffect(() => {
    if (children !== displayChildren) {
      setTransitionStage('fadeOut');
    }
  }, [children, displayChildren]);

  useEffect(() => {
    if (transitionStage === 'fadeOut') {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('fadeIn');
      }, 150); // Half of transition duration
      return () => clearTimeout(timer);
    }
  }, [transitionStage, children]);

  return (
    <div 
      className={`
        transition-all duration-300 ease-out
        ${transitionStage === 'fadeOut' 
          ? 'opacity-0 transform translate-y-2 scale-[0.98]' 
          : 'opacity-100 transform translate-y-0 scale-100'
        }
        ${className}
      `}
      key={pathname} // Force re-mount on route change
    >
      {displayChildren}
    </div>
  );
}

// Enhanced tab transition component
export function TabTransition({
  children,
  className = "",
  direction = 'fade'
}: {
  children: ReactNode;
  className?: string;
  direction?: 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down';
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  const getTransitionClasses = () => {
    const baseClasses = "transition-all duration-300 ease-out";
    
    if (!isVisible) {
      switch (direction) {
        case 'slide-left':
          return `${baseClasses} opacity-0 transform -translate-x-4`;
        case 'slide-right':
          return `${baseClasses} opacity-0 transform translate-x-4`;
        case 'slide-up':
          return `${baseClasses} opacity-0 transform -translate-y-4`;
        case 'slide-down':
          return `${baseClasses} opacity-0 transform translate-y-4`;
        default:
          return `${baseClasses} opacity-0 transform scale-95`;
      }
    }
    
    return `${baseClasses} opacity-100 transform translate-x-0 translate-y-0 scale-100`;
  };

  return (
    <div className={`${getTransitionClasses()} ${className}`}>
      {children}
    </div>
  );
}

// Staggered animation for lists
export function StaggeredAnimation({
  children,
  staggerDelay = 50,
  className = ""
}: {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    const childrenArray = Array.isArray(children) ? children : [children];
    
    const timers: NodeJS.Timeout[] = [];
    
    childrenArray.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems(prev => Math.max(prev, index + 1));
      }, index * staggerDelay);
      
      timers.push(timer);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [children, staggerDelay]);

  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className={`
            transition-all duration-300 ease-out
            ${index < visibleItems 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-4'
            }
          `}
          style={{
            transitionDelay: `${index * 20}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Bounce animation for interactive elements
export function BounceAnimation({
  children,
  trigger,
  className = ""
}: {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}) {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div 
      className={`
        transition-transform duration-300 ease-out
        ${isBouncing ? 'animate-bounce scale-110' : 'scale-100'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Pulse animation for important elements
export function PulseAnimation({
  children,
  isActive = false,
  className = ""
}: {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}) {
  return (
    <div 
      className={`
        ${isActive ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

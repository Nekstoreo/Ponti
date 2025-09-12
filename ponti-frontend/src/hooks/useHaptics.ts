"use client";

import React, { useEffect, useState } from 'react';

// Types for haptic feedback patterns
export type HapticPattern = 
  | 'light'     // Subtle feedback for small interactions
  | 'medium'    // Standard feedback for buttons, toggles
  | 'heavy'     // Strong feedback for important actions
  | 'success'   // Confirmation feedback for successful actions
  | 'warning'   // Alert feedback for warnings
  | 'error'     // Error feedback for failures
  | 'selection' // Feedback for selections/picks
  | 'impact';   // Physical impact feedback

// Haptic intensity levels
export type HapticIntensity = 'off' | 'light' | 'medium' | 'strong';

interface HapticSettings {
  enabled: boolean;
  intensity: HapticIntensity;
  respectSystemSettings: boolean;
}

// Default haptic settings
const DEFAULT_SETTINGS: HapticSettings = {
  enabled: true,
  intensity: 'medium',
  respectSystemSettings: true,
};

// Store settings in localStorage
const STORAGE_KEY = 'ponti_haptic_settings';

export function useHaptics() {
  const [settings, setSettings] = useState<HapticSettings>(DEFAULT_SETTINGS);
  const [isSupported, setIsSupported] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Failed to load haptic settings:', error);
    }

    // Check if haptic feedback is supported
    setIsSupported(
      'vibrate' in navigator || 
      'haptic' in navigator ||
      ('navigator' in window && 'vibrate' in window.navigator)
    );
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<HapticSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Failed to save haptic settings:', error);
    }
  };

  // Get vibration pattern for haptic type
  const getVibrationPattern = (pattern: HapticPattern): number | number[] => {
    const intensityMultiplier = {
      off: 0,
      light: 0.5,
      medium: 1,
      strong: 1.5,
    }[settings.intensity];

    const basePatterns = {
      light: 10,
      medium: 20,
      heavy: 40,
      success: [30, 50, 30],
      warning: [50, 100, 50],
      error: [100, 50, 100, 50, 100],
      selection: 15,
      impact: 30,
    };

    const basePattern = basePatterns[pattern];
    
    if (typeof basePattern === 'number') {
      return Math.round(basePattern * intensityMultiplier);
    }
    
    return basePattern.map(duration => Math.round(duration * intensityMultiplier));
  };

  // Main haptic feedback function
  const triggerHaptic = (pattern: HapticPattern) => {
    // Don't trigger if disabled or not supported
    if (!settings.enabled || !isSupported || settings.intensity === 'off') {
      return;
    }

    try {
      const vibrationPattern = getVibrationPattern(pattern);
      
      // Modern haptic feedback API (iOS Safari, some Android browsers)
      if ('vibrate' in navigator && navigator.vibrate) {
        navigator.vibrate(vibrationPattern);
        return;
      }

      // Fallback for older browsers
      if ('vibrate' in navigator) {
        (navigator as unknown as { vibrate: (pattern: number | number[]) => void }).vibrate(vibrationPattern);
        return;
      }

      // Web API haptic feedback (future standard)
      if ('haptic' in navigator) {
        (navigator as unknown as { haptic: { actuate: (pattern: string) => void } }).haptic.actuate(pattern);
        return;
      }

    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  // Convenience methods for common interactions
  const hapticFeedback = {
    // Button interactions
    buttonPress: () => triggerHaptic('medium'),
    buttonRelease: () => triggerHaptic('light'),
    
    // Navigation
    tabSwitch: () => triggerHaptic('selection'),
    pageTransition: () => triggerHaptic('light'),
    
    // Form interactions
    inputFocus: () => triggerHaptic('light'),
    inputSubmit: () => triggerHaptic('medium'),
    toggleSwitch: () => triggerHaptic('selection'),
    
    // Feedback states
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error'),
    
    // List interactions
    itemSelect: () => triggerHaptic('selection'),
    refreshComplete: () => triggerHaptic('success'),
    
    // Modal interactions
    modalOpen: () => triggerHaptic('light'),
    modalClose: () => triggerHaptic('light'),
    swipeToClose: () => triggerHaptic('medium'),
    
    // Gesture feedback
    swipeGesture: () => triggerHaptic('light'),
    longPress: () => triggerHaptic('heavy'),
    
    // Notification interactions
    notificationReceived: () => triggerHaptic('medium'),
    notificationDismiss: () => triggerHaptic('light'),
    
    // Map interactions
    poiTap: () => triggerHaptic('selection'),
    mapPinch: () => triggerHaptic('light'),
    
    // Schedule interactions
    classReminder: () => triggerHaptic('warning'),
    scheduleUpdate: () => triggerHaptic('medium'),
  };

  return {
    settings,
    updateSettings,
    isSupported,
    triggerHaptic,
    hapticFeedback,
  };
}

// React hook for haptic feedback on component interactions
export function useHapticFeedback(pattern: HapticPattern, deps: React.DependencyList = []) {
  const { triggerHaptic } = useHaptics();

  useEffect(() => {
    triggerHaptic(pattern);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Note: HOC functionality removed to avoid JSX in .ts file
// Use the useHaptics hook directly in components instead

// Utility function for manual haptic trigger in event handlers
// Note: This should be used inside a component that has access to useHaptics
export function createHapticHandler(triggerHaptic: (pattern: HapticPattern) => void, pattern: HapticPattern, callback?: () => void) {
  return () => {
    triggerHaptic(pattern);
    callback?.();
  };
}

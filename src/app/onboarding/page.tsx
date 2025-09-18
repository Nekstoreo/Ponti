"use client";

import { useState } from 'react';
import SplashScreen from './SplashScreen';
import OnboardingCarousel from './OnboardingCarousel';
// Nota: esta página ya está bajo el layout de la ruta /onboarding

export default function OnboardingPage() {
  const [showSplash, setShowSplash] = useState(true);
  
  const handleSplashFinish = () => {
    setShowSplash(false);
  };
  
  return (
    <div className="h-dvh w-screen overflow-hidden">
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <OnboardingCarousel />
      )}
    </div>
  );
}

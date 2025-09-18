"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const router = useRouter();

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    
    // Si ya completó el onboarding, redirigir al dashboard
    if (isAuthenticated && hasCompletedOnboarding()) {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, hasCompletedOnboarding, router]);

  // Solo mostrar el contenido si está autenticado y no ha completado onboarding
  if (!isAuthenticated || hasCompletedOnboarding()) {
    return null;
  }

  return <>{children}</>;
}

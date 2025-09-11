"use client";

import { BottomNavBar } from "@/components/BottomNavBar";
import PageHeader from "@/components/PageHeader";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/animations/PageTransition";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import OfflineIndicator, { useOfflineToast } from "@/components/offline/OfflineIndicator";

export default function MainLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const navigationConfig = usePageNavigation();
  const showOfflineToast = useOfflineToast();

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto min-h-dvh pb-16">
      {/* PageHeader condicional para páginas específicas */}
      {navigationConfig.showPageHeader && navigationConfig.title && (
        <PageHeader
          title={navigationConfig.title}
          showBackButton={navigationConfig.showBackButton}
          backTo={navigationConfig.backTo}
        />
      )}

      <div className={`px-4 pb-20 pt-4`}>
        <PageTransition>
          {children}
        </PageTransition>
      </div>
      <BottomNavBar />

      {/* Toast de conexión offline global */}
      {showOfflineToast && (
        <OfflineIndicator variant="toast" />
      )}
    </div>
  );
}



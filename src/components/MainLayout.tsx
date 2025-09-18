"use client";

import { BottomNavBar } from "@/components/BottomNavBar";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import OfflineIndicator, { useOfflineToast } from "@/components/offline/OfflineIndicator";

export default function MainLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
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
      {children}
      <BottomNavBar />

      {/* Toast de conexión offline global */}
      {showOfflineToast && (
        <OfflineIndicator variant="toast" />
      )}
    </div>
  );
}
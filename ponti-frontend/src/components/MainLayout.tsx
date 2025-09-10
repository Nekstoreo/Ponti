"use client";

import { BottomNavBar } from "@/components/BottomNavBar";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/animations/PageTransition";

export default function MainLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto min-h-dvh pb-16">
      <div className="px-4 pt-4 pb-20">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
      <BottomNavBar />
    </div>
  );
}



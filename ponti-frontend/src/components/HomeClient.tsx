"use client";

import MainLayout from "@/components/MainLayout";
import Dashboard from "@/components/dashboard/Dashboard";

export default function HomeClient() {
  return (
    <MainLayout>
      <div className="relative">
        {/* Fondo decorativo global para la home */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-[0.07] dark:opacity-[0.1]" />
          <div className="absolute bottom-[-200px] right-[-150px] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,var(--accent-foreground)_0%,transparent_70%)] opacity-[0.04] dark:opacity-[0.06]" />
        </div>
        <div className="px-4 pt-3 pb-4 space-y-4" style={{ paddingBottom: 32 }}>
          <Dashboard />
        </div>
      </div>
    </MainLayout>
  );
}

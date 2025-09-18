"use client";

import MainLayout from "@/components/MainLayout";
import OfflineSettings from "@/components/offline/OfflineSettings";

export default function ConfiguracionOfflinePage() {

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
        <OfflineSettings />
      </div>
    </MainLayout>
  );
}

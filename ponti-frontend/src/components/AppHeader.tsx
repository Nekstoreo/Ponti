"use client";

import OfflineIndicator, { useOfflineToast } from "@/components/offline/OfflineIndicator";

export default function AppHeader() {
  const showToast = useOfflineToast();

  return (
    <>
      {/* Header simplificado solo con logo y indicador offline */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xl">Ponti</span>
          </div>

          <div className="flex items-center gap-2">
            <OfflineIndicator variant="minimal" showSyncButton={false} />
          </div>
        </div>
      </div>

      {/* Toast de conexión offline */}
      {showToast && (
        <OfflineIndicator variant="toast" />
      )}
    </>
  );
}

"use client";

import OfflineIndicator, { useOfflineToast } from "@/components/offline/OfflineIndicator";
import SearchButton from "@/components/search/SearchButton";
import SearchModal, { useSearchModal } from "@/components/search/SearchModal";

export default function AppHeader() {
  const showToast = useOfflineToast();
  const { isOpen, setIsOpen, openSearch } = useSearchModal();

  return (
    <>
      {/* Header fijo con indicador offline y búsqueda */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">Ponti</span>
          </div>
          
          <div className="flex-1 max-w-md">
            <SearchButton 
              variant="input" 
              onClick={openSearch}
              showShortcut={false}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <SearchButton 
              variant="minimal" 
              onClick={openSearch}
              className="sm:hidden"
            />
            <OfflineIndicator variant="minimal" showSyncButton={false} />
          </div>
        </div>
      </div>

      {/* Modal de búsqueda */}
      <SearchModal open={isOpen} onOpenChange={setIsOpen} />

      {/* Toast de conexión offline */}
      {showToast && (
        <OfflineIndicator variant="toast" />
      )}
    </>
  );
}

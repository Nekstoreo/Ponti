"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import GlobalSearch from "./GlobalSearch";
import { SearchResult } from "@/data/types";
import { useSearchStore } from "@/store/searchStore";
import { Search, Keyboard, TrendingUp } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const { hapticFeedback } = useHaptics();
  const { searchHistory } = useSearchStore();
  const [recentlyViewed, setRecentlyViewed] = useState<SearchResult[]>([]);

  useEffect(() => {
    // Obtener elementos vistos recientemente del historial
    setRecentlyViewed(searchHistory.slice(0, 5));
  }, [searchHistory]);

  const handleResultClick = () => {
    hapticFeedback.buttonPress();
    onOpenChange(false);
  };

  const QuickActions = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Accesos rápidos
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => onOpenChange(false)}
          >
            📅 Mi horario
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => onOpenChange(false)}
          >
            📊 Calificaciones
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => onOpenChange(false)}
          >
            🗺️ Mapa campus
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => onOpenChange(false)}
          >
            💚 Bienestar
          </Button>
        </div>
      </div>

      {recentlyViewed.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Visitado recientemente</h3>
          <div className="space-y-2">
            {recentlyViewed.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start h-auto p-2"
                onClick={handleResultClick}
              >
                <span className="mr-2">{item.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Keyboard className="w-3 h-3" />
            <span>Usa ⌘K para abrir búsqueda rápida</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar en Ponti
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-4 max-h-[70vh] overflow-y-auto">
          <GlobalSearch
            variant="modal"
            placeholder="¿Qué estás buscando?"
            onResultClick={handleResultClick}
            autoFocus
            showFilters={true}
            showHistory={true}
            className="mb-6"
          />
          
          <QuickActions />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para manejar el modal de búsqueda con teclado
export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K o Ctrl+K para abrir búsqueda
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape para cerrar
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    openSearch: () => setIsOpen(true),
    closeSearch: () => setIsOpen(false)
  };
}

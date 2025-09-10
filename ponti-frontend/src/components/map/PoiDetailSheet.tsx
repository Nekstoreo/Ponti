"use client";

import { PoiItem } from "@/data/types";
import { useState, useRef, useEffect } from "react";

export default function POIDetailModal({
  open,
  onOpenChange,
  poi,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  poi: PoiItem | null;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Reset translation when modal opens/closes
  useEffect(() => {
    if (open) {
      setTranslateY(0);
      setImageError(false);
    }
  }, [open]);

  if (!open || !poi) return null;

  // Handle touch/mouse events for swipe to close
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setTranslateY(0);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    
    const deltaY = clientY - startY;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (translateY > 100) {
      onOpenChange(false);
    } else {
      setTranslateY(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientY);
  };

  // Get category-specific content
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academico':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'comida':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
          </svg>
        );
      case 'servicios':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
          </svg>
        );
      case 'cultura':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'bienestar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case 'academico': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'comida': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'servicios': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'cultura': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'bienestar': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={() => onOpenChange(false)}
    >
      <div
        ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 mx-auto max-w-md rounded-t-xl border bg-background shadow-xl transition-transform duration-300 ease-out overflow-hidden"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {/* Drag handle */}
        <div className="w-full py-3 cursor-grab active:cursor-grabbing">
          <div className="h-1 w-12 bg-muted mx-auto rounded-full" />
        </div>
        
        {/* Hero image for cultural POIs */}
        {poi.category === 'cultura' && poi.image && !imageError && (
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={poi.image} 
              alt={poi.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 pb-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-foreground flex-1">{poi.title}</h3>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColorClass(poi.category)}`}>
                  {getCategoryIcon(poi.category)}
                  <span className="capitalize">{poi.category}</span>
                </div>
              </div>
              
              {poi.subtitle && (
                <p className="text-sm text-muted-foreground font-medium">{poi.subtitle}</p>
              )}
            </div>

            {/* Status for services */}
            {poi.category === 'servicios' && poi.hours && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${poi.isOpenNow ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${poi.isOpenNow ? 'text-green-600' : 'text-red-600'}`}>
                  {poi.isOpenNow ? 'Abierto ahora' : 'Cerrado'}
                </span>
                <span className="text-sm text-muted-foreground">• {poi.hours}</span>
              </div>
            )}

            {/* Description */}
            {poi.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {poi.category === 'cultura' ? 'Historia' : 'Información'}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{poi.description}</p>
              </div>
            )}

            {/* Additional info for academic buildings */}
            {poi.category === 'academico' && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Información del edificio</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-muted-foreground">3 niveles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-muted-foreground">WiFi disponible</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact info for services */}
            {poi.category === 'servicios' && poi.contact && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Contacto</h4>
                <div className="space-y-1">
                  {poi.contact.phone && (
                    <a 
                      href={`tel:${poi.contact.phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {poi.contact.phone}
                    </a>
                  )}
                  {poi.contact.email && (
                    <a 
                      href={`mailto:${poi.contact.email}`}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {poi.contact.email}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="pt-2">
              <button
                className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                onClick={() => onOpenChange(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {poi.category === 'servicios' ? 'Ir al servicio' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



"use client";

import { ClassBlock } from "@/data/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ClassDetailSheet({
  open,
  onOpenChange,
  block,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  block: ClassBlock | null;
}) {
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  // Animate sheet from bottom on open
  useEffect(() => {
    if (open && sheetRef.current) {
      const h = sheetRef.current.getBoundingClientRect().height;
      // start off-screen
      setTranslateY(h);
      // next frame, slide up
      requestAnimationFrame(() => setTranslateY(0));
    }
  }, [open]);

  if (!open || !block) return null;

  // Handle touch/mouse events for swipe to close
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setTranslateY(0);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    
    const deltaY = clientY - startY;
    // Only allow downward swipes
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // If dragged down more than 100px, close the modal
    if (translateY > 100) {
      onOpenChange(false);
    } else {
      // Spring back to original position
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

  // Generate a more specific POI ID based on building/room
  const generatePoiId = (room: string) => {
    // Extract building info from room (e.g., "Bloque 5 - 201" -> "bloque_5")
    const buildingMatch = room.match(/bloque\s*(\d+)/i);
    if (buildingMatch) {
      return `poi_bloque_${buildingMatch[1]}`;
    }
    // Fallback to library
    return "poi_lib";
  };

  const navigateToMap = () => {
    onOpenChange(false);
    const poiId = generatePoiId(block.room);
    router.push(`/mapa?poi=${poiId}`);
  };

  const openCourseDetails = () => {
    // Placeholder for future course details functionality
    console.log("Opening course details for:", block.courseName);
    // onOpenChange(false);
    // router.push(`/cursos/${block.courseId}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={() => onOpenChange(false)}
    >
      <div
        ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 mx-auto max-w-md rounded-t-xl border bg-background shadow-xl transition-transform duration-300 ease-out"
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
        <div className="w-full py-2 cursor-grab active:cursor-grabbing">
          <div className="h-1 w-12 bg-muted mx-auto rounded-full" />
        </div>
        
        {/* Content */}
        <div className="p-4 pb-6">
          <div className="space-y-3">
            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">{block.courseName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {block.startTime} - {block.endTime}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{block.professor}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{block.room}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 gap-3 pt-4">
              <button
                className="flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-primary text-primary hover:bg-primary/5 transition-colors font-medium"
                onClick={navigateToMap}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ubicar en el Mapa
              </button>
              
              <button
                className="flex items-center justify-center gap-2 h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                onClick={openCourseDetails}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Ver Detalles del Curso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



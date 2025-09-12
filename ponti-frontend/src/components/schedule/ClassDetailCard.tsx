"use client";

import { ClassBlock } from "@/data/types";
import { useRouter } from "next/navigation";

export default function ClassDetailCard({
  block,
}: {
  block: ClassBlock | null;
}) {
  const router = useRouter();

  const navigateToMap = () => {
    const poiId = generatePoiId(block?.room || "");
    router.push(`/mapa?poi=${poiId}`);
  };

  // Generate a POI ID based on building/room
  const generatePoiId = (room: string) => {
    const buildingMatch = room.match(/bloque\s*(\d+)/i);
    if (buildingMatch) {
      return `poi_bloque_${buildingMatch[1]}`;
    }
    return "poi_lib"; // Fallback
  };

  // Si no hay bloque seleccionado, mostrar un espacio vacío del mismo tamaño
  if (!block) {
    return (
      <div className="mt-4 rounded-lg border border-dashed p-6 flex justify-center items-center text-muted-foreground">
        <p>Selecciona una clase para ver detalles</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border bg-card p-4">
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
        <div className="flex flex-wrap gap-4">
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
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            className="flex items-center justify-center gap-2 h-10 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors font-medium"
            onClick={navigateToMap}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ubicar en el Mapa
          </button>
          
          <button
            className="flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Ver Detalles del Curso
          </button>
        </div>
      </div>
    </div>
  );
}

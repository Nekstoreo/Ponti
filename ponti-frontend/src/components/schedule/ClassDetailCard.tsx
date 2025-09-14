"use client";

import { ClassBlock } from "@/data/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, BookOpen } from "lucide-react";

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

  const navigateToGradeDetail = () => {
    if (!block) return;

    // Map course names from schedule to course IDs from grades
    const courseNameMapping: Record<string, string> = {
      "Matemáticas I": "calc1",
      "Introducción a Programación": "prog1",
      "Programación I": "prog1",
      "Física I": "phys1",
      "Cálculo I": "calc1",
      "Inglés I": "eng1",
      "Historia Universal": "hist1",
      "Taller de Liderazgo": "leadership1", // Placeholder for leadership course
    };

    const courseId = courseNameMapping[block.courseName];
    if (courseId) {
      router.push(`/calificaciones/${courseId}`);
    } else {
      // Fallback: try to navigate to main grades page
      router.push("/calificaciones");
    }
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
          <h3 className="text-l font-bold text-foreground">{block.courseName}</h3>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {block.startTime} - {block.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">{block.professor}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{block.room}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={navigateToMap}
          >
            <MapPin className="w-4 h-4" />
            Ubicar en el Mapa
          </Button>

          <Button
            className="flex items-center justify-center gap-2"
            onClick={navigateToGradeDetail}
          >
            <BookOpen className="w-4 h-4" />
            Ir a Detalles
          </Button>
        </div>
      </div>
    </div>
  );
}

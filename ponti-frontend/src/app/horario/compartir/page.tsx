"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WeeklySchedule, DayKey } from "@/data/types";
import { decompressScheduleData } from "@/utils/scheduleExport";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Download, 
  ArrowLeft,
  Share2,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { generateICalendar, downloadICalFile } from "@/utils/scheduleExport";
import LoadingSkeleton from "@/components/animations/LoadingSkeleton";
import { useRouter } from "next/navigation";

const dayNames: Record<DayKey, string> = {
  D: "Domingo",
  L: "Lunes",
  M: "Martes", 
  X: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado"
};

function SharedScheduleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayKey>("L");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    
    if (!data) {
      setError("No se encontraron datos del horario en el enlace");
      setIsLoading(false);
      return;
    }

    try {
      const decompressedSchedule = decompressScheduleData(data);
      
      if (!decompressedSchedule || Object.keys(decompressedSchedule).length === 0) {
        throw new Error("Datos del horario inválidos");
      }

      setSchedule(decompressedSchedule);
      
      // Set initial day to first day with classes
      const firstDayWithClasses = Object.entries(decompressedSchedule).find(
        ([, blocks]) => blocks.length > 0
      );
      if (firstDayWithClasses) {
        setSelectedDay(firstDayWithClasses[0] as DayKey);
      }
      
    } catch (err) {
      console.error("Error parsing shared schedule:", err);
      setError("Error al cargar el horario compartido");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleDownloadSchedule = () => {
    if (!schedule) return;
    
    try {
      const iCalContent = generateICalendar(schedule);
      downloadICalFile(iCalContent, "horario_compartido");
    } catch (error) {
      console.error("Error downloading schedule:", error);
    }
  };

  const handleNativeShare = async () => {
    if (!schedule) return;

    const shareData = {
      title: "Horario Universitario - Ponti",
      text: "Horario compartido desde Ponti",
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Enlace copiado al portapapeles");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-12 w-full" />
        <LoadingSkeleton variant="schedule" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4" style={{ paddingBottom: 36 }}>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error al cargar el horario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error || "No se pudo cargar el horario compartido"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalClasses = Object.values(schedule).reduce((total, dayClasses) => 
    total + dayClasses.length, 0
  );

  const activeDays = Object.entries(schedule).filter(([, classes]) => 
    classes.length > 0
  );

  return (
    <div className="max-w-md mx-auto px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Horario Compartido</h1>
            <p className="text-sm text-muted-foreground">
              Visualiza este horario universitario
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{totalClasses}</div>
                <div className="text-xs text-muted-foreground">Clases semanales</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{activeDays.length}</div>
                <div className="text-xs text-muted-foreground">Días con clases</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadSchedule}
            className="flex-1 flex items-center gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Descargar iCal
          </Button>
          <Button
            onClick={handleNativeShare}
            variant="outline"
            className="flex-1 flex items-center gap-2"
            size="sm"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="space-y-3">
        <h2 className="font-medium text-sm">Seleccionar día</h2>
        <div className="flex gap-2 overflow-x-auto">
          {Object.entries(schedule).map(([dayKey, blocks]) => (
            <button
              key={dayKey}
              onClick={() => setSelectedDay(dayKey as DayKey)}
              disabled={blocks.length === 0}
              className={`
                flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedDay === dayKey 
                  ? "bg-primary text-primary-foreground" 
                  : blocks.length > 0
                    ? "bg-muted hover:bg-muted/80"
                    : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                }
              `}
            >
              <div className="text-center">
                <div>{dayNames[dayKey as DayKey]}</div>
                <div className="text-xs opacity-70">
                  {blocks.length > 0 ? `${blocks.length} clases` : "Sin clases"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">
            {dayNames[selectedDay]} - {format(new Date(), "dd 'de' MMMM", { locale: es })}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {schedule[selectedDay].length} clases
          </Badge>
        </div>

        {schedule[selectedDay].length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No hay clases</h3>
              <p className="text-sm text-muted-foreground">
                Este día no tiene clases programadas
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScheduleTimeline
            blocks={schedule[selectedDay]}
            onBlockClick={() => {}} // No action needed for shared view
            showNowLine={false}
          />
        )}
      </div>

      {/* Footer */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Generado con Ponti</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => window.open("/", "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir Ponti
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SharedSchedulePage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-4 space-y-4">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-12 w-full" />
        <LoadingSkeleton variant="schedule" />
      </div>
    }>
      <SharedScheduleContent />
    </Suspense>
  );
}

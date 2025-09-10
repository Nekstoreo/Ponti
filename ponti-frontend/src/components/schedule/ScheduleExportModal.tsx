"use client";

import { useState } from "react";
import { WeeklySchedule } from "@/data/types";
import { 
  generateICalendar, 
  downloadICalFile, 
  shareSchedule, 
  createShareableScheduleLink,
  formatScheduleForDisplay,
  openInCalendarApp
} from "@/utils/scheduleExport";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  Calendar,
  Link2,
  Copy,
  CheckCircle,
  X,
  Smartphone,
  Monitor,
  MessageCircle
} from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";

interface ScheduleExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: WeeklySchedule;
}

export default function ScheduleExportModal({
  open,
  onOpenChange,
  schedule
}: ScheduleExportModalProps) {
  const { userProfile } = useAuthStore();
  const { hapticFeedback } = useHaptics();
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>("");

  if (!open) return null;

  const handleGenerateICalendar = async () => {
    setIsGenerating(true);
    hapticFeedback.buttonPress();
    
    try {
      const iCalContent = generateICalendar(schedule);
      const filename = `horario_${userProfile?.fullName?.replace(/\s+/g, '_') || 'estudiante'}`;
      downloadICalFile(iCalContent, filename);
      hapticFeedback.success();
    } catch (error) {
      console.error("Error generating iCalendar:", error);
      hapticFeedback.error();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInCalendar = async () => {
    hapticFeedback.buttonPress();
    
    try {
      const iCalContent = generateICalendar(schedule);
      openInCalendarApp(iCalContent);
      hapticFeedback.success();
    } catch (error) {
      console.error("Error opening calendar:", error);
      hapticFeedback.error();
    }
  };

  const handleShareSchedule = async () => {
    hapticFeedback.buttonPress();
    
    try {
      await shareSchedule(schedule, userProfile?.fullName);
      hapticFeedback.success();
    } catch (error) {
      console.error("Error sharing schedule:", error);
      hapticFeedback.error();
    }
  };

  const handleCopyLink = async () => {
    hapticFeedback.buttonPress();
    
    try {
      const link = shareableLink || createShareableScheduleLink(schedule);
      setShareableLink(link);
      
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      hapticFeedback.success();
      
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error("Error copying link:", error);
      hapticFeedback.error();
    }
  };

  const totalClasses = Object.values(schedule).reduce((total, dayClasses) => 
    total + dayClasses.length, 0
  );

  const activeDays = Object.entries(schedule).filter(([, classes]) => 
    classes.length > 0
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300">
      <div className="fixed left-0 right-0 bottom-0 mx-auto max-w-md rounded-t-xl border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-bold">Exportar Horario</h2>
            <p className="text-sm text-muted-foreground">
              Comparte o sincroniza tu horario
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Schedule Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Resumen del Horario
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{totalClasses}</div>
                  <div className="text-xs text-muted-foreground">Clases</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">{activeDays}</div>
                  <div className="text-xs text-muted-foreground">Días</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Descargar y Sincronizar</h3>
            
            <div className="grid gap-3">
              {/* Download iCal */}
              <Button
                onClick={handleGenerateICalendar}
                disabled={isGenerating}
                className="flex items-center justify-between h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Download className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Descargar iCal</div>
                    <div className="text-xs text-muted-foreground">
                      Archivo .ics para importar
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  .ics
                </Badge>
              </Button>

              {/* Open in Calendar */}
              <Button
                onClick={handleOpenInCalendar}
                className="flex items-center justify-between h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Abrir en Calendario</div>
                    <div className="text-xs text-muted-foreground">
                      App de calendario predeterminada
                    </div>
                  </div>
                </div>
                <Smartphone className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Share Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Compartir</h3>
            
            <div className="grid gap-3">
              {/* Native Share */}
              <Button
                onClick={handleShareSchedule}
                className="flex items-center justify-between h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Share2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Compartir Enlace</div>
                    <div className="text-xs text-muted-foreground">
                      Usar apps de mensajería
                    </div>
                  </div>
                </div>
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
              </Button>

              {/* Copy Link */}
              <Button
                onClick={handleCopyLink}
                className="flex items-center justify-between h-auto p-4"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    {linkCopied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">
                      {linkCopied ? "¡Copiado!" : "Copiar Enlace"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {linkCopied ? "Enlace en portapapeles" : "Link para compartir"}
                    </div>
                  </div>
                </div>
                <Link2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Compatible Apps Info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Monitor className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Aplicaciones compatibles:</p>
                  <p>Google Calendar, Apple Calendar, Outlook, Samsung Calendar y cualquier app que soporte archivos iCal (.ics).</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Vista Previa</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs bg-muted/30 p-3 rounded font-mono max-h-32 overflow-y-auto">
                {formatScheduleForDisplay(schedule)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

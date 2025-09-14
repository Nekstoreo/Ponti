"use client";

import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { useNotificationStore } from "@/store/notificationStore";
import { mockNotifications } from "@/data/notifications";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotificacionesPage() {
  const router = useRouter();
  const { setNotifications } = useNotificationStore();

  useEffect(() => {
    // Inicializar con datos mock si no hay notificaciones
    setNotifications(mockNotifications);
  }, [setNotifications]);

  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        {/* Header con botón de regresar y título */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Notificaciones</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus notificaciones y alertas
            </p>
          </div>
        </div>

        {/* Configuración de Notificaciones */}
        <NotificationSettings />
      </div>
    </MainLayout>
  );
}

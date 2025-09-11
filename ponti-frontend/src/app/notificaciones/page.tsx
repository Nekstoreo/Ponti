"use client";

import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { useNotificationStore } from "@/store/notificationStore";
import { mockNotifications } from "@/data/notifications";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, History } from "lucide-react";

export default function NotificacionesPage() {
  const { setNotifications } = useNotificationStore();

  useEffect(() => {
    // Inicializar con datos mock si no hay notificaciones
    setNotifications(mockNotifications);
  }, [setNotifications]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <NotificationHistory />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

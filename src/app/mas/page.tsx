"use client";

import MainLayout from "@/components/MainLayout";
import PageTitle from "@/components/PageTitle";
import { useRouter } from "next/navigation";
import { ChevronRight, User, Building2, Bell, Newspaper, HelpCircle, Heart, Wifi, Calculator } from "lucide-react";

export default function MasRoute() {
  const router = useRouter();

  const menuItems = [
    {
      id: "perfil",
      label: "Perfil de Usuario",
      icon: User,
      description: "Gestiona tu información personal",
      action: () => router.push("/perfil"),
    },
    {
      id: "simulador-notas",
      label: "Simulador de Notas",
      icon: Calculator,
      description: "Proyecta tu nota final con diferentes escenarios",
      action: () => router.push("/simulador-notas"),
    },
    {
      id: "bienestar",
      label: "Centro de Apoyo y Bienestar",
      icon: Heart,
      description: "Recursos de apoyo, contactos y herramientas emocionales",
      action: () => router.push("/bienestar"),
    },
    {
      id: "noticias",
      label: "Noticias y Anuncios",
      icon: Newspaper,
      description: "Mantente al día con las últimas novedades",
      action: () => router.push("/noticias"),
    },
    {
      id: "servicios",
      label: "Directorio de Servicios",
      icon: Building2,
      description: "Encuentra todos los servicios universitarios",
      action: () => router.push("/servicios"),
    },
    {
      id: "notificaciones",
      label: "Configuración de Notificaciones",
      icon: Bell,
      description: "Personaliza tus preferencias de notificación",
      action: () => router.push("/notificaciones"),
    },
    {
      id: "configuracion-offline",
      label: "Configuración Offline",
      icon: Wifi,
      description: "Gestiona el modo offline y caché de datos",
      action: () => router.push("/configuracion-offline"),
    },
    {
      id: "ayuda",
      label: "Información y Soporte",
      icon: HelpCircle,
      description: "Información sobre la app y soporte técnico",
      action: () => router.push("/ayuda"),
    },
  ];

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
        <PageTitle
          title="Más"
          subtitle="Accede a todas las funcionalidades adicionales de Ponti"
        />

        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={item.action}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}



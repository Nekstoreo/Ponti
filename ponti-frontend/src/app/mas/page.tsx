"use client";

import MainLayout from "@/components/MainLayout";
import PageTitle from "@/components/PageTitle";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, Building2, Bell, Newspaper, HelpCircle, LogOut, BookOpen, Heart, Wifi } from "lucide-react";

export default function MasRoute() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const menuItems = [
    {
      id: "calificaciones",
      label: "Calificaciones",
      icon: BookOpen,
      description: "Consulta tus notas y rendimiento académico",
      action: () => router.push("/calificaciones"),
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
      id: "perfil",
      label: "Perfil de Usuario",
      icon: User,
      description: "Gestiona tu información personal",
      action: () => router.push("/perfil"),
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
      label: "Ayuda y Soporte",
      icon: HelpCircle,
      description: "Centro de ayuda y soporte técnico",
      action: () => console.log("Ayuda - próximamente"),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
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

        {/* Sección de cuenta */}
        <div className="pt-4 border-t">
          <div className="space-y-3">
            <h3 className="font-semibold text-muted-foreground">Cuenta</h3>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}



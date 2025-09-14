"use client";

import MainLayout from "@/components/MainLayout";
import { UserProfileComponent } from "@/components/profile/UserProfile";
import { mockUser, mockAcademicInfo } from "@/data/mockUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Newspaper, Bell, Building2, Heart, Calculator, HelpCircle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const router = useRouter();

  const quickAccessItems = [
    {
      id: "calificaciones",
      label: "Calificaciones",
      icon: BookOpen,
      action: () => router.push("/calificaciones"),
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
    {
      id: "noticias",
      label: "Noticias",
      icon: Newspaper,
      action: () => router.push("/noticias"),
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      id: "servicios",
      label: "Servicios",
      icon: Building2,
      action: () => router.push("/servicios"),
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      id: "bienestar",
      label: "Bienestar",
      icon: Heart,
      action: () => router.push("/bienestar"),
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200"
    },
    {
      id: "simulador",
      label: "Simulador",
      icon: Calculator,
      action: () => router.push("/simulador-notas"),
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    },
    {
      id: "notificaciones",
      label: "Notificaciones",
      icon: Bell,
      action: () => router.push("/notificaciones"),
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
    }
  ];

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
        {/* Header mejorado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Mi Perfil</h1>
              <p className="text-sm text-muted-foreground">
                Información y acceso rápido
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/mas")}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Más
          </Button>
        </div>

        {/* Acceso rápido */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Acceso Rápido</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`p-4 rounded-lg border ${item.color} transition-colors text-left group`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Información del perfil */}
        <UserProfileComponent
          user={mockUser}
          academicInfo={mockAcademicInfo}
        />
      </div>
    </MainLayout>
  );
}

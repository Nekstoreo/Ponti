"use client";

import MainLayout from "@/components/MainLayout";
import { UserProfileComponent } from "@/components/profile/UserProfile";
import { mockUser, mockAcademicInfo } from "@/data/mockUser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function PerfilPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
        {/* Header mejorado */}
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

        {/* Información del perfil */}
        <UserProfileComponent
          user={mockUser}
          academicInfo={mockAcademicInfo}
        />

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

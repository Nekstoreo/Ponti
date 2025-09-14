"use client";

import MainLayout from "@/components/MainLayout";
import { UserProfileComponent } from "@/components/profile/UserProfile";
import { mockUser, mockAcademicInfo } from "@/data/mockUser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const router = useRouter();

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

        {/* Información del perfil */}
        <UserProfileComponent
          user={mockUser}
          academicInfo={mockAcademicInfo}
        />
      </div>
    </MainLayout>
  );
}

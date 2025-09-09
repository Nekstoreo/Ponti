"use client";

import MainLayout from "@/components/MainLayout";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function MasRoute() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return (
    <MainLayout>
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Más</h1>
        <ul className="divide-y rounded-md border">
          <li className="p-4 flex items-center justify-between">
            <span>Perfil</span>
            <span className="text-muted-foreground text-sm">(placeholder)</span>
          </li>
          <li className="p-4 flex items-center justify-between">
            <span>Directorio de Servicios</span>
            <span className="text-muted-foreground text-sm">(placeholder)</span>
          </li>
          <li className="p-4 flex items-center justify-between">
            <span>Notificaciones</span>
            <span className="text-muted-foreground text-sm">(placeholder)</span>
          </li>
          <li className="p-4 flex items-center justify-between">
            <span>Ayuda y Soporte</span>
            <span className="text-muted-foreground text-sm">(placeholder)</span>
          </li>
          <li className="p-4 flex items-center justify-between">
            <span>Cerrar Sesión</span>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="h-8 px-3 rounded-md bg-foreground text-background"
            >
              Salir
            </button>
          </li>
        </ul>
      </div>
    </MainLayout>
  );
}



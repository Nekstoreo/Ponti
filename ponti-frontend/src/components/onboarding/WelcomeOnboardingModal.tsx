"use client";

import { useAuthStore } from "@/store/authStore";

export default function WelcomeOnboardingModal() {
  const isFirstLogin = useAuthStore((s) => s.isFirstLogin);
  const dismiss = useAuthStore((s) => s.dismissFirstLogin);

  if (!isFirstLogin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">¡Hola!</h2>
          <p className="text-sm text-muted-foreground">
            Bienvenido a Ponti. Aquí, toda tu vida universitaria está organizada en un solo lugar.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm">• Tu día, simplificado. En "Hoy" verás lo más importante.</p>
          <p className="text-sm">• Accede a tu horario, mapa y más desde la barra inferior.</p>
        </div>
        <button
          onClick={dismiss}
          className="w-full h-10 rounded-md bg-foreground text-background"
        >
          ¡Entendido!
        </button>
      </div>
    </div>
  );
}



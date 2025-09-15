"use client";

import { useParams } from "next/navigation";
import { useServiceStore } from "@/store/serviceStore";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";

export default function ServicioDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { getServiceById } = useServiceStore();

  // Verificar que params no sea null
  const hasValidParams = params && params.id;
  const serviceId = hasValidParams ? (params.id as string) : '';
  const service = hasValidParams ? getServiceById(serviceId) : undefined;

  // Redirigir si los parámetros son inválidos
  useEffect(() => {
    if (!hasValidParams) {
      const timer = setTimeout(() => {
        router.push("/servicios");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasValidParams, router]);

  useEffect(() => {
    // Si no se encuentra el servicio, redirigir después de un breve delay
    if (hasValidParams && service === undefined) {
      const timer = setTimeout(() => {
        router.push("/servicios");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasValidParams, service, router]);

  // Mostrar error de parámetros inválidos
  if (!hasValidParams) {
    return (
      <MainLayout>
        <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Parámetros inválidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Los parámetros de la URL no son válidos.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Serás redirigido al directorio de servicios en unos segundos...
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (service === undefined) {
    return (
      <MainLayout>
        <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Servicio no encontrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                El servicio que buscas no existe o ha sido eliminado.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Serás redirigido al directorio de servicios en unos segundos...
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
        <ServiceDetail service={service} />
      </div>
    </MainLayout>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useServiceStore } from "@/store/serviceStore";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ServicioDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { getServiceById } = useServiceStore();

  const serviceId = params.id as string;
  const service = getServiceById(serviceId);

  useEffect(() => {
    // Si no se encuentra el servicio, redirigir después de un breve delay
    if (service === undefined) {
      const timer = setTimeout(() => {
        router.push("/servicios");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [service, router]);

  if (service === undefined) {
    return (
      <div className="container mx-auto px-4 py-6">
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ServiceDetail service={service} />
    </div>
  );
}

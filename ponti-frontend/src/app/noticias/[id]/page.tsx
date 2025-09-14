"use client";

import { useParams } from "next/navigation";
import { useAnnouncementStore } from "@/store/announcementStore";
import { AnnouncementDetail } from "@/components/announcements/AnnouncementDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";

export default function NoticiaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { getAnnouncementById } = useAnnouncementStore();

  const announcementId = params.id as string;
  const announcement = getAnnouncementById(announcementId);

  useEffect(() => {
    // Si no se encuentra el anuncio, redirigir después de un breve delay
    if (announcement === undefined) {
      const timer = setTimeout(() => {
        router.push("/noticias");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [announcement, router]);

  if (announcement === undefined) {
    return (
      <MainLayout>
        <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Anuncio no encontrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                El anuncio que buscas no existe o ha sido eliminado.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Serás redirigido a la página de noticias en unos segundos...
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
        <AnnouncementDetail announcement={announcement} />
      </div>
    </MainLayout>
  );
}

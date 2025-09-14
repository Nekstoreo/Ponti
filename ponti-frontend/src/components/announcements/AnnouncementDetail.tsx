"use client";

import { useEffect } from "react";
import { useAnnouncementStore } from "@/store/announcementStore";
import { AnnouncementItem } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, Tag, Star, Eye, EyeOff, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface AnnouncementDetailProps {
  announcement: AnnouncementItem;
}

const categoryColors = {
  academico: "bg-blue-100 text-blue-800",
  administrativo: "bg-gray-100 text-gray-800",
  eventos: "bg-green-100 text-green-800",
  general: "bg-purple-100 text-purple-800",
};

const categoryLabels = {
  academico: "Académico",
  administrativo: "Administrativo",
  eventos: "Eventos",
  general: "General",
};

export function AnnouncementDetail({ announcement }: AnnouncementDetailProps) {
  const router = useRouter();
  const { markAsRead, markAsUnread } = useAnnouncementStore();

  useEffect(() => {
    // Marcar como leído cuando se abre el detalle
    if (!announcement.isRead) {
      markAsRead(announcement.id);
    }
  }, [announcement.id, announcement.isRead, markAsRead]);

  const handleReadToggle = () => {
    if (announcement.isRead) {
      markAsUnread(announcement.id);
    } else {
      markAsRead(announcement.id);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
      locale: es,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReadToggle}
          className="flex items-center gap-2"
        >
          {announcement.isRead ? (
            <>
              <EyeOff className="h-4 w-4" />
              Marcar como no leído
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Marcar como leído
            </>
          )}
        </Button>
      </div>

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={categoryColors[announcement.category]}
                >
                  {categoryLabels[announcement.category]}
                </Badge>
                {announcement.isImportant && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    Importante
                  </Badge>
                )}
                {!announcement.isRead && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    No leído
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl leading-tight">
                {announcement.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        {/* Carrusel de imágenes placeholder 16:9 */}
        <div className="w-full aspect-video relative">
          <Carousel className="w-full h-full">
            <CarouselContent className="w-full h-full">
              {[1, 2, 3].map((index) => (
                <CarouselItem key={index} className="w-full h-full">
                  <div className="w-full h-full bg-muted overflow-hidden">
                    <img
                      src={`/announcement-placeholder-${index}.svg`}
                      alt={`${announcement.title} - Imagen ${index}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
          </Carousel>
        </div>

        <CardContent className="space-y-4">
          {/* Resumen */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-muted-foreground leading-relaxed">
              {announcement.summary}
            </p>
          </div>

          <Separator />

          {/* Contenido completo */}
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {announcement.content}
            </p>
          </div>

          {/* Tags */}
          {announcement.tags && announcement.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  Etiquetas
                </div>
                <div className="flex flex-wrap gap-2">
                  {announcement.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{announcement.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(announcement.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones adicionales */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/noticias")}
          className="flex items-center gap-2"
        >
          Ver todas las noticias
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // Compartir funcionalidad
            if (navigator.share) {
              navigator.share({
                title: announcement.title,
                text: announcement.summary,
                url: window.location.href,
              });
            } else {
              // Fallback para navegadores que no soportan Web Share API
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="flex items-center gap-2"
        >
          Compartir
        </Button>
      </div>
    </div>
  );
}

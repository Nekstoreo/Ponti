"use client";

import { UniversityService } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Calendar, Tag, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServiceDetailProps {
  service: UniversityService;
}

const categoryColors = {
  academico: "bg-blue-100 text-blue-800",
  administrativo: "bg-gray-100 text-gray-800",
  bienestar: "bg-green-100 text-green-800",
  tecnologia: "bg-purple-100 text-purple-800",
  biblioteca: "bg-indigo-100 text-indigo-800",
  deportes: "bg-orange-100 text-orange-800",
};

const categoryLabels = {
  academico: "Académico",
  administrativo: "Administrativo",
  bienestar: "Bienestar",
  tecnologia: "Tecnología",
  biblioteca: "Biblioteca",
  deportes: "Deportes",
};

const dayLabels = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function ServiceDetail({ service }: ServiceDetailProps) {
  const router = useRouter();

  const getTodayHours = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const dayKey = days[today] as keyof typeof service.hours;
    return service.hours[dayKey] || "Cerrado";
  };

  const handleContact = (type: 'phone' | 'email' | 'website') => {
    switch (type) {
      case 'phone':
        if (service.phone) {
          window.open(`tel:${service.phone}`);
        }
        break;
      case 'email':
        if (service.email) {
          window.open(`mailto:${service.email}`);
        }
        break;
      case 'website':
        if (service.website) {
          window.open(service.website, '_blank');
        }
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 px-2 sm:px-0">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-2 sm:px-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Volver al directorio</span>
          <span className="sm:hidden">Volver</span>
        </Button>
      </div>

      {/* Información principal */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge
                  variant="secondary"
                  className={categoryColors[service.category]}
                >
                  {categoryLabels[service.category]}
                </Badge>
                {service.isOpenNow ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Eye className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Abierto ahora</span>
                    <span className="sm:hidden">Abierto</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Cerrado
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg sm:text-xl leading-tight mb-1 break-words">
                {service.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="break-words text-sm">{service.location}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Descripción */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Descripción</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>

          <Separator />

          {/* Información de contacto */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Información de Contacto</h3>
            <div className="grid gap-2">
              {service.phone && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-muted/50 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Teléfono</p>
                      <p className="text-xs text-muted-foreground break-all">{service.phone}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleContact('phone')}
                    className="w-full sm:w-auto text-xs px-3 py-1 h-8"
                  >
                    Llamar
                  </Button>
                </div>
              )}

              {service.email && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-muted/50 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Correo electrónico</p>
                      <p className="text-xs text-muted-foreground break-all">{service.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleContact('email')}
                    className="w-full sm:w-auto text-xs px-3 py-1 h-8"
                  >
                    Enviar email
                  </Button>
                </div>
              )}

              {service.website && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-muted/50 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">Sitio web</p>
                      <p className="text-xs text-muted-foreground break-all">{service.website}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleContact('website')}
                    className="w-full sm:w-auto text-xs px-3 py-1 h-8"
                  >
                    Visitar sitio
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Ubicación detallada */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Ubicación</h3>
            <div className="space-y-2">
              {service.building && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm break-words"><strong>Edificio:</strong> {service.building}</span>
                </div>
              )}
              {service.floor && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm break-words"><strong>Piso:</strong> {service.floor}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm break-words"><strong>Ubicación:</strong> {service.location}</span>
              </div>
              {service.mapLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/mapa")}
                  className="mt-3 w-full sm:w-auto"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver en el mapa
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Horario de atención */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Horario de Atención</h3>
            <div className="bg-muted/50 p-3 sm:p-3 rounded-lg mb-3 sm:mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-sm break-words">Hoy: {getTodayHours()}</span>
              </div>
            </div>
            <div className="grid gap-2">
              {Object.entries(service.hours).map(([day, hours]) => (
                <div key={day} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 gap-1">
                  <span className="text-sm font-medium break-words">
                    {dayLabels[day as keyof typeof dayLabels]}
                  </span>
                  <span className="text-sm text-muted-foreground break-words">{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm mb-2">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1 text-xs break-words">
                      <Tag className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{tag}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Acciones adicionales */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/servicios")}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          Ver todos los servicios
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // Compartir funcionalidad
            if (navigator.share) {
              navigator.share({
                title: service.name,
                text: `Servicio universitario: ${service.description}`,
                url: window.location.href,
              });
            } else {
              // Fallback para navegadores que no soportan Web Share API
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          Compartir
        </Button>
      </div>
    </div>
  );
}

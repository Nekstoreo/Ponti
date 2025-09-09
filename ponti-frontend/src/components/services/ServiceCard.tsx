"use client";

import { UniversityService } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Phone, Globe, Eye } from "lucide-react";

interface ServiceCardProps {
  service: UniversityService;
  onClick?: () => void;
  showActions?: boolean;
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

export function ServiceCard({ service, onClick, showActions = false }: ServiceCardProps) {
  const getTodayHours = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const dayKey = days[today] as keyof typeof service.hours;
    return service.hours[dayKey] || "Cerrado";
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className={categoryColors[service.category]}
              >
                {categoryLabels[service.category]}
              </Badge>
              {service.isOpenNow ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Eye className="h-3 w-3 mr-1" />
                  Abierto
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Cerrado
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight mb-1">
              {service.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{service.location}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {service.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Hoy: {getTodayHours()}
            </span>
          </div>

          {service.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{service.phone}</span>
            </div>
          )}

          {service.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Button variant="link" className="h-auto p-0 text-sm">
                Ver sitio web
              </Button>
            </div>
          )}
        </div>

        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {service.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {service.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{service.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1">
              Ver detalles
            </Button>
            {service.mapLocation && (
              <Button size="sm" variant="outline">
                <MapPin className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

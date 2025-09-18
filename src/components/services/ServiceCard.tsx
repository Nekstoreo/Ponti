"use client";

import { UniversityService } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Eye } from "lucide-react";

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

export function ServiceCard({ service, onClick }: ServiceCardProps) {


  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-sm"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={`text-xs ${categoryColors[service.category]}`}
              >
                {categoryLabels[service.category]}
              </Badge>
              {service.isOpenNow ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px]">
                  <Eye className="h-3 w-3 mr-1" />
                  Abierto
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-[10px]">
                  Cerrado
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight mb-1 truncate">
              {service.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{service.location}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {service.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {service.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

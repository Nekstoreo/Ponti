"use client";

import { useEffect } from "react";
import { useServiceStore } from "@/store/serviceStore";
import { ServiceCard } from "./ServiceCard";
import { mockServices } from "@/data/services";
import { ServiceCategory } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, MapPin, Settings, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const categories: { value: ServiceCategory | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "academico", label: "Académicos" },
  { value: "administrativo", label: "Administrativos" },
  { value: "bienestar", label: "Bienestar" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "biblioteca", label: "Biblioteca" },
  { value: "deportes", label: "Deportes" },
];

export function ServiceDirectory() {
  const router = useRouter();
  const {
    services,
    filteredServices,
    selectedCategory,
    showOnlyOpenNow,
    setServices,
    setSelectedCategory,
    toggleOpenNowFilter,
  } = useServiceStore();

  useEffect(() => {
    // Inicializar con datos mock si no hay servicios
    if (services.length === 0) {
      setServices(mockServices);
    }
  }, [services.length, setServices]);

  const handleCardClick = (serviceId: string) => {
    router.push(`/servicios/${serviceId}`);
  };

  const openServicesCount = services.filter(s => s.isOpenNow).length;
  const totalServicesCount = services.length;

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Directorio de Servicios</h1>
          <p className="text-muted-foreground">
            Encuentra todos los servicios disponibles en la universidad
          </p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-2">
        <Button
          variant={showOnlyOpenNow ? "default" : "outline"}
          size="sm"
          onClick={toggleOpenNowFilter}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Solo abiertos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/mapa")}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Ver en mapa
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="flex gap-4">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {openServicesCount} abiertos ahora
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Settings className="h-3 w-3" />
          {totalServicesCount} servicios totales
        </Badge>
      </div>

      {/* Filtros por categoría */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ServiceCategory | "all")}>
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value as ServiceCategory | "all")}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  selectedCategory === category.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
          {/* Indicadores de scroll */}
          <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        <TabsContent value={selectedCategory} className="mt-4">
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 pr-4">
              {filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No se encontraron servicios</h3>
                  <p className="text-muted-foreground">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => handleCardClick(service.id)}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

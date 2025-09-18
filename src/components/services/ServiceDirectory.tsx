"use client";

import { useEffect } from "react";
import { useServiceStore } from "@/store/serviceStore";
import { ServiceCard } from "./ServiceCard";
import { mockServices } from "@/data/services";
import { ServiceCategory } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, MapPin, Settings, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
      {/* Header compacto con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Servicios</h1>
            <p className="text-muted-foreground text-sm">Directorio de servicios universitarios</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {openServicesCount} abiertos
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            {totalServicesCount} totales
          </Badge>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={showOnlyOpenNow ? "default" : "outline"}
          size="sm"
          onClick={toggleOpenNowFilter}
          className="flex-1 min-w-0 flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          <span className="truncate">Solo abiertos</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/mapa")}
          className="flex-1 min-w-0 flex items-center justify-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          <span className="truncate">Ver en mapa</span>
        </Button>
      </div>

      {/* Filtros por categoría (Tabs) */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ServiceCategory | "all")}>
        <div className="overflow-x-auto scrollbar-hide px-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <TabsList className="flex w-max h-auto p-1 bg-muted rounded-lg gap-2">
            {categories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="h-8 px-3 text-xs font-medium whitespace-nowrap shrink-0"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={selectedCategory} className="mt-4">
          <div className="h-[60vh] overflow-auto">
            <div className="space-y-3 pr-4">
              {filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No se encontraron servicios</h3>
                  <p className="text-muted-foreground">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                </div>
              ) : (
                <>
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => handleCardClick(service.id)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

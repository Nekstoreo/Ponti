"use client";

import { useEffect } from "react";
import { useServiceStore } from "@/store/serviceStore";
import { ServiceCard } from "./ServiceCard";
import { mockServices } from "@/data/services";
import { ServiceCategory } from "@/data/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, Eye, MapPin } from "lucide-react";
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
    searchQuery,
    selectedCategory,
    showOnlyOpenNow,
    setServices,
    setSearchQuery,
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
      <div>
        <h1 className="text-2xl font-bold">Directorio de Servicios</h1>
        <p className="text-muted-foreground">
          Encuentra todos los servicios disponibles en la universidad
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar servicios por nombre, descripción o ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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
      </div>

      {/* Estadísticas rápidas */}
      <div className="flex gap-4">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {openServicesCount} abiertos ahora
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Filter className="h-3 w-3" />
          {totalServicesCount} servicios totales
        </Badge>
      </div>

      {/* Filtros por categoría */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ServiceCategory | "all")}>
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value} className="text-xs">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 pr-4">
              {filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
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

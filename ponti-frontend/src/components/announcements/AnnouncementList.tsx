"use client";

import { useEffect, useState } from "react";
import { useAnnouncementStore } from "@/store/announcementStore";
import { AnnouncementCard } from "./AnnouncementCard";
import { mockAnnouncements } from "@/data/mockAnnouncements";
import { AnnouncementCategory } from "@/data/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, CheckCheck, Eye, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const categories: { value: AnnouncementCategory | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "academico", label: "Académicas" },
  { value: "administrativo", label: "Administrativas" },
  { value: "eventos", label: "Eventos" },
  { value: "general", label: "Generales" },
];

export function AnnouncementList() {
  const router = useRouter();
  const {
    announcements,
    filteredAnnouncements,
    searchQuery,
    selectedCategory,
    showOnlyUnread,
    showOnlyImportant,
    setAnnouncements,
    setSearchQuery,
    setSelectedCategory,
    toggleUnreadFilter,
    toggleImportantFilter,
    markAllAsRead,
  } = useAnnouncementStore();

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Inicializar con datos mock si no hay anuncios
    if (announcements.length === 0) {
      setAnnouncements(mockAnnouncements);
    }
  }, [announcements.length, setAnnouncements]);

  const handleCardClick = (announcementId: string) => {
    router.push(`/noticias/${announcementId}`);
  };

  const loadMore = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    // Simular carga de más anuncios
    setTimeout(() => {
      setIsLoading(false);
      // En una implementación real, aquí cargaríamos más datos de la API
      // Por ahora, solo marcamos que no hay más datos
      setHasMore(false);
    }, 1000);
  };

  const unreadCount = announcements.filter(a => !a.isRead).length;
  const importantCount = announcements.filter(a => a.isImportant).length;

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Noticias y Anuncios</h1>
          <p className="text-muted-foreground">
            Mantente al día con las últimas novedades de la universidad
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {unreadCount} sin leer
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {importantCount} importantes
          </Badge>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por título, contenido o etiquetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showOnlyUnread ? "default" : "outline"}
            size="sm"
            onClick={toggleUnreadFilter}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Solo no leídas
          </Button>
          <Button
            variant={showOnlyImportant ? "default" : "outline"}
            size="sm"
            onClick={toggleImportantFilter}
            className="flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Importantes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {/* Filtros por categoría */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as AnnouncementCategory | "all")}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value} className="text-xs">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4 pr-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-8">
                  <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No se encontraron anuncios</h3>
                  <p className="text-muted-foreground">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                </div>
              ) : (
                <>
                  {filteredAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      onClick={() => handleCardClick(announcement.id)}
                      showActions={true}
                    />
                  ))}

                  {hasMore && (
                    <div className="text-center py-4">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? "Cargando..." : "Cargar más"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

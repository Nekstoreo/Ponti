"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlobalSearch from "@/components/search/GlobalSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchStore, getCategoryIcon } from "@/store/searchStore";
import { SearchCategory } from "@/data/types";
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Filter,
  BarChart3,
  Zap,
  ArrowLeft
} from "lucide-react";

export default function BuscarPage() {
  const router = useRouter();
  const { recentSearches, searchHistory, search } = useSearchStore();
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory | 'todo'>('todo');

  const popularSearches = [
    "matemáticas", "programación", "biblioteca", "cafetería", 
    "calificaciones", "horario", "bienestar", "laboratorio"
  ];

  const searchStats = [
    { label: "Resultados encontrados esta semana", value: "127", icon: BarChart3 },
    { label: "Búsquedas realizadas", value: recentSearches.length.toString(), icon: Search },
    { label: "Elementos visitados", value: searchHistory.length.toString(), icon: TrendingUp }
  ];

  const handleQuickSearch = (query: string) => {
    search(query);
  };

  const categories: Array<{ key: SearchCategory | 'todo', label: string, description: string }> = [
    { key: 'todo', label: 'Todas las categorías', description: 'Buscar en todo Ponti' },
    { key: 'horarios', label: 'Horarios y Clases', description: 'Encontrar materias y horarios' },
    { key: 'calificaciones', label: 'Calificaciones', description: 'Consultar notas y promedios' },
    { key: 'mapa', label: 'Lugares del Campus', description: 'Ubicaciones y servicios' },
    { key: 'anuncios', label: 'Anuncios y Noticias', description: 'Información oficial' },
    { key: 'bienestar', label: 'Bienestar Estudiantil', description: 'Salud y bienestar' },
    { key: 'configuracion', label: 'Configuración', description: 'Ajustes de la aplicación' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Búsqueda Avanzada</h1>
          <p className="text-sm text-muted-foreground">
            Encuentra cualquier cosa en Ponti
          </p>
        </div>
      </div>

      {/* Buscador principal */}
      <Card>
        <CardContent className="p-6">
          <GlobalSearch
            variant="full"
            placeholder="¿Qué estás buscando en Ponti?"
            autoFocus
            showFilters={true}
            showHistory={true}
          />
        </CardContent>
      </Card>

      {/* Estadísticas de búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {searchStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categorías de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Buscar por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.key)}
                className="h-auto p-4 justify-start"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getCategoryIcon(category.key)}</span>
                  <div className="text-left">
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Búsquedas populares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Búsquedas Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleQuickSearch(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historial de búsquedas */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Búsquedas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSearches.slice(0, 5).map((query, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => handleQuickSearch(query)}
                  className="w-full justify-start"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {query}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Elementos visitados recientemente */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Visitado Recientemente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchHistory.slice(0, 5).map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => router.push(item.route)}
                  className="w-full justify-start h-auto p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips de búsqueda */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Search className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">💡 Consejos para Búsquedas Efectivas</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Usa palabras clave específicas como &ldquo;programación lunes&rdquo; o &ldquo;biblioteca horario&rdquo;</li>
                <li>• Prueba sinónimos: &ldquo;notas&rdquo; o &ldquo;calificaciones&rdquo;, &ldquo;mapa&rdquo; o &ldquo;ubicación&rdquo;</li>
                <li>• Filtra por categoría para resultados más precisos</li>
                <li>• Usa ⌘K (Cmd+K) o Ctrl+K para búsqueda rápida desde cualquier lugar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { create } from "zustand";
import { SearchResult, SearchFilters, SearchState, SearchCategory } from "@/data/types";

interface SearchActions {
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSearching: (isSearching: boolean) => void;
  addRecentSearch: (query: string) => void;
  addToHistory: (result: SearchResult) => void;
  clearResults: () => void;
  clearHistory: () => void;
  search: (query: string, customFilters?: Partial<SearchFilters>) => Promise<SearchResult[]>;
  getSearchableContent: () => SearchResult[];
}

interface SearchStore extends SearchState, SearchActions {}

// Datos mock para búsqueda
const mockSearchableContent: SearchResult[] = [
  // Horarios
  {
    id: "class_matematicas",
    title: "Matemáticas Discretas",
    description: "Lunes 8:00 - 10:00 AM • Aula 301",
    category: "horarios",
    subcategory: "clases",
    route: "/horario",
    icon: "📐",
    relevanceScore: 0,
    metadata: {
      time: "8:00 - 10:00",
      location: "Aula 301",
      date: "Lunes",
      tags: ["matematicas", "discretas", "logica"]
    }
  },
  {
    id: "class_programacion",
    title: "Programación I",
    description: "Martes 14:00 - 16:00 PM • Lab. Sistemas",
    category: "horarios",
    subcategory: "clases",
    route: "/horario",
    icon: "💻",
    relevanceScore: 0,
    metadata: {
      time: "14:00 - 16:00",
      location: "Lab. Sistemas",
      date: "Martes",
      tags: ["programacion", "codigo", "algoritmos"]
    }
  },
  {
    id: "class_fisica",
    title: "Física II",
    description: "Miércoles 10:00 - 12:00 PM • Aula 205",
    category: "horarios",
    subcategory: "clases",
    route: "/horario",
    icon: "⚛️",
    relevanceScore: 0,
    metadata: {
      time: "10:00 - 12:00",
      location: "Aula 205",
      date: "Miércoles",
      tags: ["fisica", "ciencias", "laboratorio"]
    }
  },
  
  // Calificaciones
  {
    id: "grade_matematicas",
    title: "Calificaciones de Matemáticas",
    description: "Promedio actual: 4.2/5.0 • 3 evaluaciones",
    category: "calificaciones",
    subcategory: "notas",
    route: "/calificaciones",
    icon: "📊",
    relevanceScore: 0,
    metadata: {
      status: "aprobado",
      tags: ["notas", "promedio", "matematicas"]
    }
  },
  {
    id: "grade_programacion",
    title: "Calificaciones de Programación",
    description: "Promedio actual: 4.8/5.0 • 2 evaluaciones",
    category: "calificaciones",
    subcategory: "notas", 
    route: "/calificaciones",
    icon: "💯",
    relevanceScore: 0,
    metadata: {
      status: "excelente",
      tags: ["notas", "programacion", "proyecto"]
    }
  },
  
  // Mapa/POIs
  {
    id: "poi_biblioteca",
    title: "Biblioteca Central",
    description: "Horario: 7:00 - 22:00 • Edificio A",
    category: "mapa",
    subcategory: "servicios",
    route: "/mapa",
    icon: "📚",
    relevanceScore: 0,
    metadata: {
      location: "Edificio A",
      time: "7:00 - 22:00",
      tags: ["biblioteca", "libros", "estudio", "silencio"]
    }
  },
  {
    id: "poi_cafeteria",
    title: "Cafetería Central",
    description: "Comida y bebidas • Planta baja Edificio B",
    category: "mapa",
    subcategory: "servicios",
    route: "/mapa",
    icon: "☕",
    relevanceScore: 0,
    metadata: {
      location: "Edificio B",
      tags: ["cafeteria", "comida", "desayuno", "almuerzo"]
    }
  },
  {
    id: "poi_laboratorio",
    title: "Laboratorio de Sistemas",
    description: "Computadoras y equipos técnicos • Edificio C-2F",
    category: "mapa",
    subcategory: "academico",
    route: "/mapa",
    icon: "🔬",
    relevanceScore: 0,
    metadata: {
      location: "Edificio C-2F", 
      tags: ["laboratorio", "computadoras", "programacion", "sistemas"]
    }
  },
  
  // Anuncios
  {
    id: "announcement_examen",
    title: "Examen de Matemáticas Discretas",
    description: "Recordatorio: Examen el viernes 15 de marzo",
    category: "anuncios",
    subcategory: "academico",
    route: "/noticias",
    icon: "📝",
    relevanceScore: 0,
    metadata: {
      date: "15 de marzo",
      tags: ["examen", "matematicas", "recordatorio"]
    }
  },
  {
    id: "announcement_evento",
    title: "Feria de Empleo Tecnológico",
    description: "Oportunidades laborales • 20 de marzo • Auditorio",
    category: "anuncios",
    subcategory: "eventos",
    route: "/noticias",
    icon: "💼",
    relevanceScore: 0,
    metadata: {
      date: "20 de marzo",
      location: "Auditorio",
      tags: ["empleo", "trabajo", "tecnologia", "feria"]
    }
  },
  
  // Bienestar
  {
    id: "wellness_mood",
    title: "Registro de Estado de Ánimo",
    description: "Registra tu estado diario • Seguimiento de bienestar",
    category: "bienestar",
    subcategory: "seguimiento",
    route: "/bienestar/mood-tracker",
    icon: "😊",
    relevanceScore: 0,
    metadata: {
      tags: ["animo", "humor", "bienestar", "salud", "mental"]
    }
  },
  {
    id: "wellness_recommendations",
    title: "Recomendaciones de Bienestar",
    description: "Consejos personalizados para tu bienestar",
    category: "bienestar",
    subcategory: "recomendaciones",
    route: "/bienestar",
    icon: "💡",
    relevanceScore: 0,
    metadata: {
      tags: ["consejos", "recomendaciones", "salud", "tips"]
    }
  },
  
  // Configuración
  {
    id: "config_notifications",
    title: "Configuración de Notificaciones",
    description: "Personaliza tus alertas y recordatorios",
    category: "configuracion",
    subcategory: "notificaciones",
    route: "/notificaciones",
    icon: "🔔",
    relevanceScore: 0,
    metadata: {
      tags: ["notificaciones", "alertas", "configuracion"]
    }
  },
  {
    id: "config_offline", 
    title: "Configuración Offline",
    description: "Gestiona el modo sin conexión y caché",
    category: "configuracion",
    subcategory: "offline",
    route: "/configuracion-offline",
    icon: "📶",
    relevanceScore: 0,
    metadata: {
      tags: ["offline", "cache", "sincronizacion", "configuracion"]
    }
  },
  {
    id: "config_profile",
    title: "Perfil de Usuario",
    description: "Gestiona tu información personal",
    category: "configuracion",
    subcategory: "perfil",
    route: "/perfil",
    icon: "👤",
    relevanceScore: 0,
    metadata: {
      tags: ["perfil", "usuario", "informacion", "personal"]
    }
  }
];

export const useSearchStore = create<SearchStore>((set, get) => ({
  // Estado inicial
  query: "",
  results: [],
  filters: {
    categories: ['todo'],
    sortBy: 'relevance',
    maxResults: 20
  },
  isSearching: false,
  recentSearches: [],
  searchHistory: [],

  // Acciones básicas
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  setSearching: (isSearching) => set({ isSearching }),

  clearResults: () => set({ results: [], query: "" }),

  // Gestión de historial
  addRecentSearch: (query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) return;
    
    set((state) => ({
      recentSearches: [
        trimmedQuery,
        ...state.recentSearches.filter(q => q !== trimmedQuery)
      ].slice(0, 10) // Mantener solo las últimas 10
    }));
  },

  addToHistory: (result) => {
    set((state) => ({
      searchHistory: [
        result,
        ...state.searchHistory.filter(r => r.id !== result.id)
      ].slice(0, 20) // Mantener solo los últimos 20
    }));
  },

  clearHistory: () => set({ recentSearches: [], searchHistory: [] }),

  // Obtener contenido buscable
  getSearchableContent: () => mockSearchableContent,

  // Función principal de búsqueda
  search: async (query, customFilters) => {
    const { filters, addRecentSearch } = get();
    const searchFilters = { ...filters, ...customFilters };
    
    set({ isSearching: true });
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const trimmedQuery = query.trim().toLowerCase();
      if (trimmedQuery.length < 1) {
        set({ results: [], isSearching: false });
        return [];
      }

      const searchableContent = mockSearchableContent;
      let results: SearchResult[] = [];

      // Filtrar por categorías si no es 'todo'
      let filteredContent = searchableContent;
      if (!searchFilters.categories.includes('todo')) {
        filteredContent = searchableContent.filter(item =>
          searchFilters.categories.includes(item.category)
        );
      }

      // Buscar en título, descripción y tags
      results = filteredContent
        .map(item => {
          let score = 0;
          const searchTerms = trimmedQuery.split(' ').filter(term => term.length > 0);
          
          for (const term of searchTerms) {
            // Búsqueda en título (peso mayor)
            if (item.title.toLowerCase().includes(term)) {
              score += item.title.toLowerCase().startsWith(term) ? 10 : 5;
            }
            
            // Búsqueda en descripción
            if (item.description.toLowerCase().includes(term)) {
              score += 3;
            }
            
            // Búsqueda en tags
            if (item.metadata?.tags?.some(tag => tag.toLowerCase().includes(term))) {
              score += 2;
            }
            
            // Búsqueda en subcategoría
            if (item.subcategory?.toLowerCase().includes(term)) {
              score += 2;
            }
            
            // Búsqueda en metadatos
            if (item.metadata?.location?.toLowerCase().includes(term)) {
              score += 1;
            }
            
            if (item.metadata?.time?.toLowerCase().includes(term)) {
              score += 1;
            }
          }
          
          return { ...item, relevanceScore: score };
        })
        .filter(item => item.relevanceScore > 0);

      // Ordenar resultados
      if (searchFilters.sortBy === 'relevance') {
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      } else if (searchFilters.sortBy === 'alphabetical') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      }

      // Limitar resultados
      results = results.slice(0, searchFilters.maxResults);

      set({ results, isSearching: false });
      addRecentSearch(query);
      
      return results;
    } catch (error) {
      console.error('Error in search:', error);
      set({ results: [], isSearching: false });
      return [];
    }
  }
}));

// Utilidades para iconos de categorías
export const getCategoryIcon = (category: SearchCategory): string => {
  const icons = {
    horarios: "📅",
    calificaciones: "📊", 
    mapa: "🗺️",
    anuncios: "📢",
    bienestar: "💚",
    configuracion: "⚙️",
    todo: "🔍"
  };
  return icons[category];
};

export const getCategoryLabel = (category: SearchCategory): string => {
  const labels = {
    horarios: "Horarios",
    calificaciones: "Calificaciones",
    mapa: "Mapa",
    anuncios: "Anuncios", 
    bienestar: "Bienestar",
    configuracion: "Configuración",
    todo: "Todas las categorías"
  };
  return labels[category];
};

// Hook para búsqueda con debounce
export const useDebounceSearch = (query: string, delay: number = 300) => {
  const { search } = useSearchStore();
  
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 0) {
        search(query);
      }
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [query, delay, search]);
};

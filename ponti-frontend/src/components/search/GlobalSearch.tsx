"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore, getCategoryIcon, getCategoryLabel } from "@/store/searchStore";
import { SearchCategory, SearchResult } from "@/data/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  X,
  Clock,
  ArrowRight
} from "lucide-react";
import LoadingSkeleton from "@/components/animations/LoadingSkeleton";
import { StaggeredAnimation } from "@/components/animations/PageTransition";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  variant?: 'full' | 'compact' | 'modal';
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
  autoFocus?: boolean;
  showFilters?: boolean;
  showHistory?: boolean;
  className?: string;
}

export default function GlobalSearch({
  variant = 'full',
  placeholder = "Buscar en Ponti...",
  onResultClick,
  autoFocus = false,
  showFilters = true,
  showHistory = true,
  className
}: GlobalSearchProps) {
  const router = useRouter();
  const { hapticFeedback } = useHaptics();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchCategory | 'todo'>('todo');

  const {
    results,
    isSearching,
    recentSearches,
    setQuery,
    setFilters,
    search,
    addToHistory,
    clearResults,
    clearHistory
  } = useSearchStore();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localQuery.trim().length > 0) {
        setQuery(localQuery);
        search(localQuery);
        setShowResults(true);
      } else {
        clearResults();
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localQuery, search, setQuery, clearResults]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleResultClick = (result: SearchResult) => {
    hapticFeedback.buttonPress();
    addToHistory(result);
    onResultClick?.(result);
    
    // Navegar a la ruta del resultado
    router.push(result.route);
    
    // Limpiar búsqueda si es modal
    if (variant === 'modal') {
      setLocalQuery("");
      setShowResults(false);
    }
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setLocalQuery(recentQuery);
    setQuery(recentQuery);
    search(recentQuery);
    setShowResults(true);
    hapticFeedback.buttonPress();
  };

  const handleClearSearch = () => {
    setLocalQuery("");
    clearResults();
    setShowResults(false);
    inputRef.current?.focus();
    hapticFeedback.buttonPress();
  };

  const handleCategoryFilter = (category: SearchCategory) => {
    setActiveTab(category);
    setFilters({ categories: category === 'todo' ? ['todo'] : [category] });
    if (localQuery.trim().length > 0) {
      search(localQuery);
    }
    hapticFeedback.tabSwitch();
  };

  // Filtrar resultados por categoría activa
  const filteredResults = activeTab === 'todo' 
    ? results 
    : results.filter(result => result.category === activeTab);

  // Agrupar resultados por categoría para vista completa
  const groupedResults = results.reduce((groups, result) => {
    if (!groups[result.category]) {
      groups[result.category] = [];
    }
    groups[result.category].push(result);
    return groups;
  }, {} as Record<SearchCategory, SearchResult[]>);

  const SearchInput = () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-10 pr-10",
          variant === 'compact' && "h-8 text-sm",
          variant === 'full' && "h-12 text-base"
        )}
        onFocus={() => setShowResults(true)}
      />
      {localQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
      {isSearching && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );

  const CategoryTabs = () => (
    <Tabs value={activeTab} onValueChange={(value) => handleCategoryFilter(value as SearchCategory)}>
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
        <TabsTrigger value="todo" className="text-xs">
          <span className="mr-1">{getCategoryIcon('todo')}</span>
          Todo
        </TabsTrigger>
        <TabsTrigger value="horarios" className="text-xs">
          <span className="mr-1">{getCategoryIcon('horarios')}</span>
          Horarios
        </TabsTrigger>
        <TabsTrigger value="calificaciones" className="text-xs">
          <span className="mr-1">{getCategoryIcon('calificaciones')}</span>
          Notas
        </TabsTrigger>
        <TabsTrigger value="mapa" className="text-xs">
          <span className="mr-1">{getCategoryIcon('mapa')}</span>
          Mapa
        </TabsTrigger>
        <TabsTrigger value="anuncios" className="text-xs hidden lg:flex">
          <span className="mr-1">{getCategoryIcon('anuncios')}</span>
          Noticias
        </TabsTrigger>
        <TabsTrigger value="bienestar" className="text-xs hidden lg:flex">
          <span className="mr-1">{getCategoryIcon('bienestar')}</span>
          Bienestar
        </TabsTrigger>
        <TabsTrigger value="configuracion" className="text-xs hidden lg:flex">
          <span className="mr-1">{getCategoryIcon('configuracion')}</span>
          Config
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const ResultItem = ({ result }: { result: SearchResult }) => (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
      onClick={() => handleResultClick(result)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{result.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">{result.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {getCategoryLabel(result.category)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {result.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {result.metadata?.location && (
                  <span>📍 {result.metadata.location}</span>
                )}
                {result.metadata?.time && (
                  <span>🕒 {result.metadata.time}</span>
                )}
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="text-center py-8">
      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-medium text-muted-foreground mb-2">
        {localQuery ? 'No se encontraron resultados' : 'Busca en Ponti'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {localQuery 
          ? `Intenta con términos diferentes a "${localQuery}"`
          : 'Encuentra horarios, calificaciones, lugares y más'
        }
      </p>
    </div>
  );

  const RecentSearches = () => (
    showHistory && recentSearches.length > 0 && (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Búsquedas recientes
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-xs"
          >
            Limpiar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {recentSearches.slice(0, 5).map((recentQuery, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleRecentSearchClick(recentQuery)}
            >
              {recentQuery}
            </Badge>
          ))}
        </div>
      </div>
    )
  );

  if (variant === 'compact') {
    return (
      <Popover open={showResults} onOpenChange={setShowResults}>
        <PopoverTrigger asChild>
          <div className={className}>
            <SearchInput />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList className="max-h-80">
              {isSearching ? (
                <div className="p-4">
                  <LoadingSkeleton variant="list" count={3} />
                </div>
              ) : filteredResults.length > 0 ? (
                <CommandGroup>
                  {filteredResults.slice(0, 6).map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleResultClick(result)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">{result.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{result.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : localQuery ? (
                <CommandEmpty>No se encontraron resultados</CommandEmpty>
              ) : (
                <div className="p-4">
                  <RecentSearches />
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <SearchInput />
      
      {showFilters && <CategoryTabs />}
      
      {showResults && (
        <div className="space-y-4">
          {!localQuery && <RecentSearches />}
          
          {isSearching ? (
            <LoadingSkeleton variant="list" count={4} />
          ) : filteredResults.length > 0 ? (
            activeTab === 'todo' ? (
              // Vista agrupada por categorías
              <StaggeredAnimation staggerDelay={50}>
                {Object.entries(groupedResults).map(([category, categoryResults]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <span>{getCategoryIcon(category as SearchCategory)}</span>
                      {getCategoryLabel(category as SearchCategory)}
                      <Badge variant="secondary" className="text-xs">
                        {categoryResults.length}
                      </Badge>
                    </h3>
                    <div className="grid gap-2">
                      {categoryResults.slice(0, 3).map((result) => (
                        <ResultItem key={result.id} result={result} />
                      ))}
                    </div>
                  </div>
                ))}
              </StaggeredAnimation>
            ) : (
              // Vista filtrada por categoría
              <StaggeredAnimation staggerDelay={50}>
                {filteredResults.map((result) => (
                  <ResultItem key={result.id} result={result} />
                ))}
              </StaggeredAnimation>
            )
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
}

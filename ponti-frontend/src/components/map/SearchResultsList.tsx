"use client";

import { PoiItem, PoiCategory } from "@/data/types";
import { useState, useEffect, useMemo } from "react";

interface SearchResultsListProps {
  query: string;
  pois: PoiItem[];
  activeFilter: PoiCategory;
  isVisible: boolean;
  onResultClick: (poi: PoiItem) => void;
  onClose: () => void;
}

export default function SearchResultsList({
  query,
  pois,
  activeFilter,
  isVisible,
  onResultClick,
  onClose,
}: SearchResultsListProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter and search logic
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    
    let filteredPois = pois;
    
    // Apply category filter if not "todo"
    if (activeFilter !== 'todo') {
      filteredPois = pois.filter(poi => poi.category === activeFilter);
    }
    
    // Search in multiple fields with scoring
    const scoredResults = filteredPois.map(poi => {
      let score = 0;
      const title = poi.title.toLowerCase();
      const subtitle = poi.subtitle?.toLowerCase() || '';
      const description = poi.description?.toLowerCase() || '';
      const category = poi.category.toLowerCase();
      
      // Exact title match gets highest score
      if (title === searchTerm) score += 100;
      // Title starts with search term
      else if (title.startsWith(searchTerm)) score += 80;
      // Title contains search term
      else if (title.includes(searchTerm)) score += 60;
      
      // Subtitle matches
      if (subtitle.includes(searchTerm)) score += 40;
      
      // Description matches
      if (description.includes(searchTerm)) score += 20;
      
      // Category matches
      if (category.includes(searchTerm)) score += 10;
      
      return { poi, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // Limit to 8 results
    .map(result => result.poi);
    
    return scoredResults;
  }, [query, pois, activeFilter]);

  // Animation handling
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Category icon helper
  const getCategoryIcon = (category: PoiCategory) => {
    switch (category) {
      case 'academico':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'comida':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
          </svg>
        );
      case 'servicios':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
          </svg>
        );
      case 'cultura':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M8 6l4-4 4 4v4H8V6z" />
          </svg>
        );
      case 'bienestar':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  const getCategoryColorClass = (category: PoiCategory) => {
    switch (category) {
      case 'academico': return 'text-blue-600';
      case 'comida': return 'text-orange-600';
      case 'servicios': return 'text-purple-600';
      case 'cultura': return 'text-pink-600';
      case 'bienestar': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const handleResultClick = (poi: PoiItem) => {
    onResultClick(poi);
    onClose();
  };

  if (!isAnimating && !isVisible) return null;

  return (
    <div 
      className={`
        absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-20 
        transition-all duration-200 ease-out origin-top
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm text-muted-foreground">
            {searchResults.length > 0 
              ? `${searchResults.length} resultado${searchResults.length === 1 ? '' : 's'} para "${query}"`
              : `No se encontraron resultados para "${query}"`
            }
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Results */}
      <div className="max-h-64 overflow-y-auto">
        {searchResults.length > 0 ? (
          <div className="p-1">
            {searchResults.map((poi, index) => (
              <button
                key={poi.id}
                onClick={() => handleResultClick(poi)}
                className="w-full p-3 rounded-md hover:bg-muted transition-colors text-left flex items-start gap-3 group"
              >
                <div className={`mt-0.5 ${getCategoryColorClass(poi.category)}`}>
                  {getCategoryIcon(poi.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {highlightMatch(poi.title, query)}
                    </h4>
                    {poi.isOpenNow !== undefined && (
                      <div className={`w-2 h-2 rounded-full ${poi.isOpenNow ? 'bg-green-500' : 'bg-red-500'}`} />
                    )}
                  </div>
                  
                  {poi.subtitle && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {highlightMatch(poi.subtitle, query)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{poi.category}</span>
                    {poi.hours && (
                      <>
                        <span>•</span>
                        <span>{poi.hours}</span>
                      </>
                    )}
                  </div>
                </div>

                <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mb-1">No se encontraron resultados</p>
            <p className="text-xs text-muted-foreground">
              Intenta con otros términos o cambia el filtro de categoría
            </p>
          </div>
        )}
      </div>

      {/* Quick actions footer */}
      {searchResults.length > 0 && (
        <div className="border-t p-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>↑↓ Navegar • Enter Seleccionar</span>
            <span>Esc Cerrar</span>
          </div>
        </div>
      )}
    </div>
  );
}

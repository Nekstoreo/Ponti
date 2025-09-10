"use client";

import { PoiCategory } from "@/data/types";
import { useMapStore } from "@/store/mapStore";
import { useRef, useState } from "react";
import SearchResultsList from "./SearchResultsList";

const categories: { 
  key: PoiCategory; 
  label: string; 
  icon: React.ReactNode;
  color: string;
}[] = [
  { 
    key: "todo", 
    label: "Todo",
    color: "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    )
  },
  { 
    key: "academico", 
    label: "Académico",
    color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    key: "comida", 
    label: "Comida",
    color: "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
      </svg>
    )
  },
  { 
    key: "servicios", 
    label: "Servicios",
    color: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
      </svg>
    )
  },
  { 
    key: "bienestar", 
    label: "Bienestar",
    color: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  { 
    key: "cultura", 
    label: "Cultura",
    color: "text-pink-600 bg-pink-50 border-pink-200 hover:bg-pink-100",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M8 6l4-4 4 4v4H8V6z" />
      </svg>
    )
  },
];

export default function MapFilterCarousel() {
  const filter = useMapStore((s) => s.filter);
  const setFilter = useMapStore((s) => s.setFilter);
  const query = useMapStore((s) => s.query);
  const setQuery = useMapStore((s) => s.setQuery);
  const pois = useMapStore((s) => s.pois);
  const selectPoi = useMapStore((s) => s.selectPoi);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleFilterClick = (categoryKey: PoiCategory) => {
    // Animate filter selection
    setFilter(categoryKey);
    
    // Auto-scroll to selected filter if needed
    if (carouselRef.current) {
      const selectedElement = carouselRef.current.querySelector(`[data-category="${categoryKey}"]`) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    if (query.length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    setSearchFocused(false);
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowSearchResults(false), 150);
  };

  const getFilterButtonClasses = (categoryKey: PoiCategory) => {
    const category = categories.find(c => c.key === categoryKey);
    const isSelected = filter === categoryKey;
    
    if (isSelected) {
      return "bg-primary text-primary-foreground border-primary shadow-md scale-105";
    }
    
    return `${category?.color || ''} border transition-all duration-200 ease-out hover:scale-105`;
  };

  return (
    <div className="space-y-3 relative">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Buscar salones, cafeterías, oficinas..."
            className={`w-full h-12 pl-10 pr-4 rounded-lg border bg-background transition-all duration-200 ${
              searchFocused ? 'border-primary ring-2 ring-primary/20' : 'border-input'
            }`}
          />
          {query && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results */}
        <SearchResultsList
          query={query}
          pois={pois}
          activeFilter={filter}
          isVisible={showSearchResults && query.length > 0}
          onResultClick={(poi) => selectPoi(poi.id)}
          onClose={() => setShowSearchResults(false)}
        />
      </div>

      {/* Filter Carousel */}
      <div className="relative">
        <div 
          ref={carouselRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <button
              key={category.key}
              data-category={category.key}
              onClick={() => handleFilterClick(category.key)}
              className={`
                flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium
                whitespace-nowrap snap-center transition-all duration-200 ease-out
                ${getFilterButtonClasses(category.key)}
              `}
            >
              {category.icon}
              <span>{category.label}</span>
              {filter === category.key && category.key !== 'todo' && (
                <div className="w-1 h-1 rounded-full bg-current opacity-75 ml-1" />
              )}
            </button>
          ))}
        </div>
        
        {/* Scroll indicators */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-full bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-4 h-full bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Active Filter Summary */}
      {filter !== 'todo' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg text-sm">
          <span className="text-muted-foreground">Mostrando:</span>
          <div className="flex items-center gap-1">
            {categories.find(c => c.key === filter)?.icon}
            <span className="font-medium">{categories.find(c => c.key === filter)?.label}</span>
          </div>
          <button
            onClick={() => setFilter('todo')}
            className="ml-auto text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Ver todo
          </button>
        </div>
      )}
    </div>
  );
}



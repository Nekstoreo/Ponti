import { create } from "zustand";
import { UniversityService, ServiceCategory } from "@/data/types";

interface ServiceState {
  services: UniversityService[];
  filteredServices: UniversityService[];
  searchQuery: string;
  selectedCategory: ServiceCategory | "all";
  showOnlyOpenNow: boolean;
  setServices: (services: UniversityService[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: ServiceCategory | "all") => void;
  toggleOpenNowFilter: () => void;
  getServiceById: (id: string) => UniversityService | undefined;
  updateFilteredServices: () => void;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  filteredServices: [],
  searchQuery: "",
  selectedCategory: "all",
  showOnlyOpenNow: false,

  setServices: (services) => {
    set({ services });
    get().updateFilteredServices();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().updateFilteredServices();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().updateFilteredServices();
  },

  toggleOpenNowFilter: () => {
    set((state) => ({ showOnlyOpenNow: !state.showOnlyOpenNow }));
    get().updateFilteredServices();
  },

  getServiceById: (id) => {
    return get().services.find((service) => service.id === id);
  },

  updateFilteredServices: () => {
    const { services, searchQuery, selectedCategory, showOnlyOpenNow } = get();

    let filtered = services;

    // Aplicar filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (service.building && service.building.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Aplicar filtro de categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    // Aplicar filtro de abierto ahora
    if (showOnlyOpenNow) {
      filtered = filtered.filter((service) => service.isOpenNow);
    }

    // Ordenar por nombre
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));

    set({ filteredServices: filtered });
  },
}));

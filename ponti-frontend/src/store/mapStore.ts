import { create } from "zustand";
import { PoiCategory, PoiItem } from "@/data/types";

interface MapState {
  pois: PoiItem[];
  filter: PoiCategory;
  query: string;
  selectedPoiId: string | null;
  filteredPois: PoiItem[];
  setPois: (items: PoiItem[]) => void;
  setFilter: (f: PoiCategory) => void;
  setQuery: (q: string) => void;
  selectPoi: (id: string | null) => void;
}

const computeFilteredPois = (pois: PoiItem[], filter: PoiCategory, query: string): PoiItem[] => {
  const byFilter = filter === "todo" ? pois : pois.filter((p) => p.category === filter);
  if (!query.trim()) return byFilter;
  const q = query.toLowerCase();
  return byFilter.filter(
    (p) => p.title.toLowerCase().includes(q) || (p.subtitle ?? "").toLowerCase().includes(q)
  );
};

export const useMapStore = create<MapState>((set, get) => ({
  pois: [],
  filter: "todo",
  query: "",
  selectedPoiId: null,
  filteredPois: [],
  setPois: (items) => {
    set({ pois: items, filteredPois: computeFilteredPois(items, get().filter, get().query) });
  },
  setFilter: (f) => {
    set((state) => ({ filter: f, filteredPois: computeFilteredPois(state.pois, f, state.query) }));
  },
  setQuery: (q) => {
    set((state) => ({ query: q, filteredPois: computeFilteredPois(state.pois, state.filter, q) }));
  },
  selectPoi: (id) => set({ selectedPoiId: id }),
}));



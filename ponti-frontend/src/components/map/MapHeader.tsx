"use client";

import { PoiCategory } from "@/data/types";
import { useMapStore } from "@/store/mapStore";

const categories: { key: PoiCategory; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "academico", label: "Académico" },
  { key: "comida", label: "Comida" },
  { key: "servicios", label: "Servicios" },
  { key: "bienestar", label: "Bienestar" },
  { key: "cultura", label: "Cultura" },
];

export default function MapHeader() {
  const filter = useMapStore((s) => s.filter);
  const setFilter = useMapStore((s) => s.setFilter);
  const query = useMapStore((s) => s.query);
  const setQuery = useMapStore((s) => s.setQuery);

  return (
    <div className="space-y-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar salones, cafeterías, oficinas..."
        className="w-full h-10 rounded-md border px-3 bg-background"
      />
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`h-8 rounded-full px-3 border text-sm ${
              filter === c.key ? "bg-foreground text-background" : ""
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}



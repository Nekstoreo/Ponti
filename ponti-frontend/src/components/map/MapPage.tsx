"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPois } from "@/services/mapService";
import { useMapStore } from "@/store/mapStore";
import MapHeader from "@/components/map/MapHeader";
import MapCanvas from "@/components/map/MapCanvas";
import PoiDetailSheet from "@/components/map/PoiDetailSheet";
import { useSearchParams } from "next/navigation";

export default function MapPage() {
  const setPois = useMapStore((s) => s.setPois);
  const filteredPois = useMapStore((s) => s.filteredPois);
  const selectedPoiId = useMapStore((s) => s.selectedPoiId);
  const selectPoi = useMapStore((s) => s.selectPoi);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const pois = await fetchPois();
      setPois(pois);
      // si viene ?poi, seleccionarlo
      const fromQuery = searchParams.get("poi");
      if (fromQuery && pois.some((p) => p.id === fromQuery)) {
        selectPoi(fromQuery);
      }
    } catch (e) {
      setError("No se pudieron cargar los puntos de interés.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPoi = useMemo(
    () => filteredPois.find((p) => p.id === selectedPoiId) ?? null,
    [filteredPois, selectedPoiId]
  );

  return (
    <div className="space-y-3">
      <MapHeader />

      {loading ? (
        <div className="rounded-md border h-[420px] animate-pulse bg-muted/50" />
      ) : error ? (
        <div className="rounded-md border p-4 space-y-3">
          <p className="font-medium">No se pudo cargar el mapa</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button className="h-9 px-3 rounded-md bg-foreground text-background w-fit" onClick={load}>
            Reintentar
          </button>
        </div>
      ) : (
        <MapCanvas onPoiClick={(id) => selectPoi(id)} />
      )}

      <PoiDetailSheet open={Boolean(selectedPoi)} onOpenChange={(v) => !v && selectPoi(null)} poi={selectedPoi} />
    </div>
  );
}



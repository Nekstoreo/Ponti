"use client";

import { useMapStore } from "@/store/mapStore";
import { useEffect, useRef, useState } from "react";

export default function MapCanvas({
  onPoiClick,
}: {
  onPoiClick: (poiId: string) => void;
}) {
  const pois = useMapStore((s) => s.filteredPois);
  const selectedPoiId = useMapStore((s) => s.selectedPoiId);
  const selectPoi = useMapStore((s) => s.selectPoi);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.min(3, Math.max(0.6, s + delta)));
    }
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    setPanning(true);
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!panning) return;
    setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
  }
  function onMouseUp() {
    setPanning(false);
  }

  useEffect(() => {
    // centrar/zoom a POI seleccionado
    if (!selectedPoiId || !containerRef.current) return;
    const poi = pois.find((p) => p.id === selectedPoiId);
    if (!poi) return;
    setScale(1.8);
    const rect = containerRef.current.getBoundingClientRect();
    const targetX = (poi.x / 100) * rect.width;
    const targetY = (poi.y / 100) * rect.height;
    setOffset({ x: rect.width / 2 - targetX, y: rect.height / 2 - targetY });
  }, [selectedPoiId]);

  return (
    <div
      ref={containerRef}
      className="relative h-[420px] border rounded-md overflow-hidden bg-muted"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseUp}
      onMouseUp={onMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
      >
        {/* aquí iría la imagen/vector del mapa; usamos fondo neutro */}
        {pois.map((p) => (
          <button
            key={p.id}
            className={`absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background ${
              selectedPoiId === p.id ? "ring-2 ring-foreground" : ""
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            title={p.title}
            onClick={(e) => {
              e.stopPropagation();
              selectPoi(p.id);
              onPoiClick(p.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}



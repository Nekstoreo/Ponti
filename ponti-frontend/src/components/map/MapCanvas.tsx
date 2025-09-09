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
  const [pinching, setPinching] = useState(false);
  const pinchStart = useRef({
    dist: 0,
    scale: 1,
    offset: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
  });

  // mouse handlers para panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // solo botón izquierdo
    if (e.button !== 0) return;
    setPanning(true);
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panning) {
      setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
    }
  };

  const handleMouseUp = () => {
    setPanning(false);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wheelHandler = (e: WheelEvent) => {
      // evitar scroll de la página
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (e.ctrlKey) {
        // pinch-zoom de trackpad: usar ctrlKey como indicativo
        setScale((prevScale) => {
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          const next = Math.max(0.5, Math.min(prevScale + delta, 3));
          // ajustar offset para mantener el punto bajo el cursor en su posición
          setOffset((prevOffset) => {
            const scaleRatio = next / prevScale;
            const dx = (mouseX - prevOffset.x) * (scaleRatio - 1);
            const dy = (mouseY - prevOffset.y) * (scaleRatio - 1);
            return { x: prevOffset.x - dx, y: prevOffset.y - dy };
          });
          return next;
        });
      } else {
        // desplazamiento natural para pan
        setOffset((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };

    const touchStartHandler = (e: TouchEvent) => {
      const rect = el.getBoundingClientRect();
      if (e.touches.length === 1) {
        setPanning(true);
        setPinching(false);
        setStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
      } else if (e.touches.length === 2) {
        setPanning(false);
        setPinching(true);
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        pinchStart.current = { dist, scale, offset: { ...offset }, center: { x: cx, y: cy } };
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      const rect = el.getBoundingClientRect();
      if (pinching && e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        const next = Math.max(0.5, Math.min((pinchStart.current.scale * dist) / pinchStart.current.dist, 3));
        setScale(next);
        const ratio = next / pinchStart.current.scale;
        setOffset({
          x: cx - (pinchStart.current.center.x - pinchStart.current.offset.x) * ratio,
          y: cy - (pinchStart.current.center.y - pinchStart.current.offset.y) * ratio,
        });
      } else if (panning && e.touches.length === 1) {
        e.preventDefault();
        setOffset({ x: e.touches[0].clientX - start.x, y: e.touches[0].clientY - start.y });
      }
    };

    const touchEndHandler = () => {
      if (pinching) setPinching(false);
      if (panning) setPanning(false);
    };

    el.addEventListener("wheel", wheelHandler, { passive: false });
    el.addEventListener("touchstart", touchStartHandler, { passive: false });
    el.addEventListener("touchmove", touchMoveHandler, { passive: false });
    el.addEventListener("touchend", touchEndHandler);

    return () => {
      el.removeEventListener("wheel", wheelHandler as EventListener);
      el.removeEventListener("touchstart", touchStartHandler as EventListener);
      el.removeEventListener("touchmove", touchMoveHandler as EventListener);
      el.removeEventListener("touchend", touchEndHandler as EventListener);
    };
  }, [scale, offset.x, offset.y, start.x, start.y, panning, pinching]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoiId]);

  return (
    <div
      ref={containerRef}
      className="relative h-[420px] border rounded-md overflow-hidden bg-muted touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src="/map.jpg"
        alt="Mapa de la universidad"
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "center",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
      >
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



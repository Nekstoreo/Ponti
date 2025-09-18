"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function MapCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.2);
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
  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);

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
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

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
          // Limitar el zoom mínimo a -1 y máximo a 4
          const next = Math.max(-1, Math.min(prevScale + delta, 4));
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
        // Usar el desplazamiento para hacer pan
        const scrollSpeed = 1.0;
        setOffset((prev) => ({ 
          x: prev.x - e.deltaX * scrollSpeed, 
          y: prev.y - e.deltaY * scrollSpeed 
        }));
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
        pinchStart.current = { dist, scale: scaleRef.current, offset: { ...offsetRef.current }, center: { x: cx, y: cy } };
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
        const next = Math.max(0.25, Math.min((pinchStart.current.scale * dist) / pinchStart.current.dist, 4));

        // Mantener el centro actual del gesto (cx, cy) fijo durante el zoom
        const prevScale = scaleRef.current;
        const prevOffset = offsetRef.current;
        const scaleRatio = next / prevScale;
        const dx_offset = (cx - prevOffset.x) * (scaleRatio - 1);
        const dy_offset = (cy - prevOffset.y) * (scaleRatio - 1);
        const newOffset = {
          x: prevOffset.x - dx_offset,
          y: prevOffset.y - dy_offset,
        };

        offsetRef.current = newOffset;
        scaleRef.current = next;
        setOffset(newOffset);
        setScale(next);
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
  }, [scale, offset, start.x, start.y, panning, pinching]);

  // Reset para centrar mapa inicialmente
  useEffect(() => {
    if (containerRef.current) {
      // Centrar mapa inicialmente con un pequeño delay para asegurar que el contenedor está renderizado
      const timer = setTimeout(() => {
        setOffset({ x: 0, y: 0 });
        setScale(0.8);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[60vh] border rounded-md overflow-hidden bg-white touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Capa de imagen del mapa */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          willChange: "transform",
        }}
      >
        <Image
          src="/map.jpg"
          alt="Mapa de la universidad"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none select-none"
          draggable={false}
          style={{
            width: "150vh",
            height: "auto",
            objectFit: "contain",
            imageRendering: "auto",
            filter: "contrast(1.05) saturate(1.1)",
          }}
          width={0}
          height={0}
          sizes="150vh"
          priority
        />
      </div>
    </div>
  );
}



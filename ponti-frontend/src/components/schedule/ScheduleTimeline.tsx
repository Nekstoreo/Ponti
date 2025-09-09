"use client";

import { ClassBlock } from "@/data/types";
import { useEffect, useMemo, useRef, useState } from "react";

const START_HOUR = 7;
const END_HOUR = 21; // 9 PM
const HOUR_HEIGHT = 56; // px por hora

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToOffsetPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

function subjectColor(subject: string): string {
  // Map determinista simple por hash
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = (hash << 5) - hash + subject.charCodeAt(i);
  const hues = [200, 150, 100, 260, 20, 300, 340];
  const hue = hues[Math.abs(hash) % hues.length];
  return `hsl(${hue} 70% 90%)`;
}

export default function ScheduleTimeline({
  blocks,
  onBlockClick,
  showNowLine,
}: {
  blocks: ClassBlock[];
  onBlockClick: (block: ClassBlock) => void;
  showNowLine: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nowLineRef = useRef<HTMLDivElement | null>(null);
  const [nowOffset, setNowOffset] = useState<number | null>(null);

  const hours = useMemo(() => {
    return Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => START_HOUR + i);
  }, []);

  useEffect(() => {
    function updateNow() {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const startMins = START_HOUR * 60;
      const endMins = END_HOUR * 60;
      if (mins < startMins || mins > endMins) {
        setNowOffset(null);
      } else {
        setNowOffset(minutesToOffsetPx(mins - startMins));
      }
    }
    if (showNowLine) {
      updateNow();
      const id = setInterval(updateNow, 60 * 1000);
      return () => clearInterval(id);
    }
  }, [showNowLine]);

  useEffect(() => {
    // al montar, desplazar ligeramente hacia la hora actual si existe
    if (!containerRef.current) return;
    if (nowOffset != null) {
      containerRef.current.scrollTop = Math.max(nowOffset - 100, 0);
    }
  }, [nowOffset]);

  return (
    <div className="relative border rounded-md overflow-auto" ref={containerRef} style={{ maxHeight: 520 }}>
      {/* columnas */}
      <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
        {/* líneas y etiquetas de horas */}
        {hours.map((h, idx) => (
          <div key={h} className="absolute left-0 right-0" style={{ top: idx * HOUR_HEIGHT }}>
            <div className="flex items-center gap-2 px-2">
              <div className="w-10 text-xs text-muted-foreground">{h}:00</div>
              <div className="flex-1 border-t" />
            </div>
          </div>
        ))}

        {/* línea de ahora */}
        {showNowLine && nowOffset != null && (
          <div
            ref={nowLineRef}
            className="absolute left-0 right-0 px-2"
            style={{ top: nowOffset }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10" />
              <div className="flex-1 h-[2px] bg-red-500" />
              <div className="size-2 rounded-full bg-red-500" />
            </div>
          </div>
        )}

        {/* bloques */}
        {blocks.map((b) => {
          const start = timeToMinutes(b.startTime) - START_HOUR * 60;
          const end = timeToMinutes(b.endTime) - START_HOUR * 60;
          const height = minutesToOffsetPx(end - start);
          const top = minutesToOffsetPx(start);
          const bg = subjectColor(b.courseName);
          return (
            <button
              key={b.id}
              onClick={() => onBlockClick(b)}
              className="absolute left-[64px] right-2 text-left rounded-md border p-2 hover:bg-accent"
              style={{ top, height, background: bg }}
            >
              <p className="text-sm font-medium leading-tight">{b.courseName}</p>
              <p className="text-xs leading-tight">{b.startTime} - {b.endTime}</p>
              <p className="text-xs text-muted-foreground leading-tight">{b.professor} • {b.room}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}



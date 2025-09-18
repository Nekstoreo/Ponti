"use client";

import { ClassBlock } from "@/data/types";
import { useEffect, useMemo, useRef, useState } from "react";

const START_HOUR = 5;
const END_HOUR = 22; // 10 PM
const HOUR_HEIGHT = 56; // px por hora

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToOffsetPx(minutes: number): number {
  // Convertir minutos a píxeles y redondear para alinear con líneas de hora exactas
  return Math.round((minutes / 60) * HOUR_HEIGHT);
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
  viewMode = 'day',
  blocks,
  weeklySchedule,
  onBlockClick,
  showNowLine,
  referenceMonday,
}: {
  viewMode?: 'day' | 'week';
  blocks: ClassBlock[];
  weeklySchedule?: Record<string, ClassBlock[]>;
  onBlockClick: (block: ClassBlock) => void;
  showNowLine: boolean;
  referenceMonday?: Date;
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
    <div
      className="relative border rounded-md select-none"
      ref={containerRef}
    >
      {viewMode === 'day' ? (
        <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
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
                <p className="text-xs text-muted-foreground leading-tight truncate">{b.room}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="overflow-auto" style={{ height: 'calc(86vh - 4rem)' }}>
          <div className="grid" style={{
              gridTemplateColumns: '60px repeat(7, minmax(150px, 1fr))',
              gridTemplateRows: `auto repeat(${(END_HOUR - START_HOUR) * 2}, 30px)`,
              minWidth: '1200px'
          }}>
              {/* Capa de fondo blanco para la columna de horas */}
              <div className="bg-white z-5 col-start-1 col-end-2" style={{ gridRow: '1 / -1' }} />

              {/* Header de días */}
              <div className="sticky top-0 bg-white z-20 col-start-1 col-end-2 row-start-1 row-end-2 border-r" />
              {(['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const).map((dKey, i) => {
                  const date = referenceMonday ? new Date(referenceMonday.getTime() + i * 24 * 60 * 60 * 1000) : new Date();
                  const dayName = new Intl.DateTimeFormat("es-ES", {
                    weekday: "short",
                  }).format(date);
                  const dayNumber = new Intl.DateTimeFormat("es-ES", {
                    day: "numeric",
                  }).format(date);
                  
                  return (
                    <div key={dKey} className="sticky top-0 bg-background z-20 text-center font-medium text-sm py-2 border-b border-r" style={{gridColumn: i + 2}}>
                        <div className="text-xs text-muted-foreground">{dayName}</div>
                        <div className="text-sm font-bold">{dayNumber}</div>
                    </div>
                  );
              })}

              {/* Grid de horas y clases */}
              {hours.map(h => (
                  <div key={h} className="row-start-auto bg-white z-10 border-r" style={{ gridRow: (h - START_HOUR) * 2 + 2, gridColumn: 1 }}>
                      <div className="text-right pr-2 text-xs text-muted-foreground -translate-y-2">{h}:00</div>
                  </div>
              ))}

              {/* Líneas de las horas */}
              {Array.from({ length: (END_HOUR - START_HOUR) * 2 + 1 }).map((_, i) => (
                  <div key={i} className="col-start-1 col-end-9 border-b" style={{ gridRow: i + 2, borderBottomWidth: '1.5px' }} />
              ))}

              {/* Líneas de los días */}
              {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="row-start-1 border-r" style={{ gridColumn: i + 1, gridRowEnd: (END_HOUR - START_HOUR) * 2 + 4, borderRightWidth: '1.5px' }} />
              ))}

              {/* Bloques de clases */}
              {Object.entries(weeklySchedule || {}).flatMap(([day, dayBlocks]) => {
                  const dayIndex = ['D', 'L', 'M', 'X', 'J', 'V', 'S'].indexOf(day);
                  if (dayIndex === -1) return [];

                  return (dayBlocks || []).map(b => {
                      const start = timeToMinutes(b.startTime);
                      const end = timeToMinutes(b.endTime);
                      
                      const startRow = Math.floor((start - START_HOUR * 60) / 30) + 2;
                      const endRow = Math.ceil((end - START_HOUR * 60) / 30) + 2;

                      const col = dayIndex + 2;
                      const bg = subjectColor(b.courseName);

                      return (
                          <button
                              key={b.id}
                              id={`class-${b.id}`}
                              onClick={() => onBlockClick(b)}
                              className="text-left rounded-md border p-2 mx-4 flex flex-col justify-between overflow-hidden"
                              style={{
                                  gridColumn: col,
                                  gridRow: `${startRow} / ${endRow}`,
                                  background: bg,
                                  zIndex: 5,
                              }}
                          >
                              <div>
                                  <p className="text-sm font-medium leading-tight">{b.courseName}</p>
                                  <p className="text-xs leading-tight">{b.startTime} - {b.endTime}</p>
                              </div>
                              <p className="text-xs text-muted-foreground leading-tight truncate">{b.room}</p>
                          </button>
                      );
                  });
              })}

          </div>
      </div>
      )}
    </div>
  );
}



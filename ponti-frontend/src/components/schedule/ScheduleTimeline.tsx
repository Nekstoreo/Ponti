"use client";

import { ClassBlock } from "@/data/types";
import { useEffect, useMemo, useRef, useState } from "react";

const START_HOUR = 6;
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
  onSwipeDay,
}: {
  viewMode?: 'day' | 'week';
  blocks: ClassBlock[];
  weeklySchedule?: Record<string, ClassBlock[]>;
  onBlockClick: (block: ClassBlock) => void;
  showNowLine: boolean;
  onSwipeDay?: (direction: 'left' | 'right') => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nowLineRef = useRef<HTMLDivElement | null>(null);
  const [nowOffset, setNowOffset] = useState<number | null>(null);
  
  // Swipe gesture state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeThreshold] = useState(50); // Minimum swipe distance

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

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStartX === null || touchStartY === null) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Check if it's more horizontal than vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      e.preventDefault(); // Prevent scrolling when swiping horizontally
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || touchStartX === null || touchStartY === null) {
      setIsDragging(false);
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Check if it's a horizontal swipe (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        // Swipe right - go to previous day
        onSwipeDay?.('right');
      } else {
        // Swipe left - go to next day
        onSwipeDay?.('left');
      }
    }

    setIsDragging(false);
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Mouse events for desktop support
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setTouchStartY(e.clientY);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null || touchStartY === null) return;
    
    const deltaX = e.clientX - touchStartX;
    const deltaY = e.clientY - touchStartY;
    
    // Visual feedback could be added here
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold / 2) {
      document.body.style.cursor = deltaX > 0 ? 'w-resize' : 'e-resize';
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null || touchStartY === null) {
      setIsDragging(false);
      setTouchStartX(null);
      setTouchStartY(null);
      document.body.style.cursor = '';
      return;
    }

    const deltaX = e.clientX - touchStartX;
    const deltaY = e.clientY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        onSwipeDay?.('right');
      } else {
        onSwipeDay?.('left');
      }
    }

    setIsDragging(false);
    setTouchStartX(null);
    setTouchStartY(null);
    document.body.style.cursor = '';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTouchStartX(null);
      setTouchStartY(null);
      document.body.style.cursor = '';
    }
  };

  return (
    <div
      className="relative border rounded-md select-none"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
                <p className="text-xs text-muted-foreground leading-tight">{b.professor} • {b.room}</p>
              </button>
            );
          })}
        </div>
      ) : (
        // Week view: 7 columns (days) x rows (hours) with absolute-positioned blocks inside each column
        <div className="w-full overflow-auto">
          <div className="grid grid-cols-7 gap-2 p-2">
            {(['D','L','M','X','J','V','S'] as const).map((dKey) => {
              const dayBlocks = weeklySchedule?.[dKey] ?? [];
              return (
                <div key={dKey} className="relative border rounded-md h-[86vh] bg-background overflow-hidden">
                  <div className="text-xs text-muted-foreground mb-1 text-center font-medium sticky top-0 bg-background py-1">{dKey}</div>
                  {/* container for hours */}
                  <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
                    {/* horizontal hour lines */}
                    {hours.map((h, idx) => (
                      <div key={h} className="absolute left-0 right-0" style={{ top: idx * HOUR_HEIGHT }}>
                        <div className="flex items-center gap-2 px-2">
                          <div className="w-10 text-xs text-muted-foreground">{h}:00</div>
                          <div className="flex-1 border-t" />
                        </div>
                      </div>
                    ))}

                    {/* blocks positioned by time */}
                    {dayBlocks.map((b) => {
                      const start = timeToMinutes(b.startTime) - START_HOUR * 60;
                      const end = timeToMinutes(b.endTime) - START_HOUR * 60;
                      const height = minutesToOffsetPx(end - start);
                      const top = minutesToOffsetPx(start);
                      const bg = subjectColor(b.courseName);
                      return (
                        <button
                          key={b.id}
                          onClick={() => onBlockClick(b)}
                          className="absolute left-2 right-2 text-left rounded-md border p-2 hover:bg-accent"
                          style={{ top, height, background: bg }}
                        >
                          <p className="text-sm font-medium leading-tight">{b.courseName}</p>
                          <p className="text-xs leading-tight">{b.startTime} - {b.endTime}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}



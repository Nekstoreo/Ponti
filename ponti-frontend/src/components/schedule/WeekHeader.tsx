"use client";

import { DayKey } from "@/data/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List, CalendarDays } from "lucide-react";

function getDayKeyByIndex(index: number): DayKey {
  // Map donde 0 = Lunes, 6 = Domingo
  const map: DayKey[] = ["L", "M", "X", "J", "V", "S", "D"];
  return map[index] ?? "L";
}

function getIndexByDayKey(dayKey: DayKey): number {
  // Map donde L = 0, D = 6
  const map: Record<DayKey, number> = { L: 0, M: 1, X: 2, J: 3, V: 4, S: 5, D: 6 };
  return map[dayKey];
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getWeekStart(date: Date): Date {
  // Convierte para que lunes sea 0
  const diff = (date.getDay() + 6) % 7; 
  const monday = new Date(date);
  monday.setDate(date.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function TimeNavigator({
  selectedDay,
  setSelectedDay,
  referenceMonday,
  setReferenceMonday,
  viewMode,
  setViewMode,
}: {
  selectedDay: DayKey;
  setSelectedDay: (d: DayKey) => void;
  referenceMonday: Date;
  setReferenceMonday: (d: Date) => void;
  viewMode: 'day' | 'week';
  setViewMode: (v: 'day' | 'week') => void;
}) {
  // calendar picker removed; keep placeholder state out

  const monthYear = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(referenceMonday);

  const today = new Date();
  const todayYMD = today.toDateString();
  const selectedIndex = getIndexByDayKey(selectedDay);


  const handleDayClick = (dayKey: DayKey) => {
    setSelectedDay(dayKey);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    const newMonday = addDays(referenceMonday, days);
    setReferenceMonday(newMonday);
  };

  const jumpToToday = () => {
    const today = new Date();
    // Calculate the Monday of the current week
    const todayWeekStart = getWeekStart(today);
    setReferenceMonday(todayWeekStart);

    // Set today as selected day
    // Convert JS day (0=Sunday, 1=Monday...) to our index (0=Monday, 1=Tuesday...)
    const todayDayIndex = (today.getDay() + 6) % 7; 
    setSelectedDay(getDayKeyByIndex(todayDayIndex));
  };

  // date picker removed


  return (
    <div className="space-y-3">
      {/* Month/Year header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm">
            {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label={`Cambiar a vista de ${viewMode === 'day' ? 'semana' : 'día'}`}
            onClick={() => setViewMode(viewMode === 'day' ? 'week' : 'day')}
            className="text-xs w-24"
          >
            {viewMode === 'day' ? (
              <>
                <CalendarDays className="w-3 h-3 mr-1" />
                Día
              </>
            ) : (
              <>
                <List className="w-3 h-3 mr-1" />
                Semana
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={jumpToToday}
            className="text-xs"
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Semana anterior"
            onClick={() => navigateWeek('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Semana siguiente"
            onClick={() => navigateWeek('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day buttons */}
      {viewMode === 'day' && (
        <div className="flex gap-1 justify-between">
          {Array.from({ length: 7 }).map((_, idx) => {
            const date = addDays(referenceMonday, idx);
            const labelDay = new Intl.DateTimeFormat("es-ES", {
              day: "numeric",
            }).format(date);
            const dayName = new Intl.DateTimeFormat("es-ES", {
              weekday: "short",
            }).format(date);
            
            const isSelected = idx === selectedIndex;
            const isToday = date.toDateString() === todayYMD;
            const dayKey = getDayKeyByIndex(idx);
            
            return (
              <Button
                key={idx}
                variant="outline"
                onClick={() => handleDayClick(dayKey)}
                className={`
                  flex flex-col items-center justify-center h-14 px-2 py-2 text-xs flex-1
                  transition-all duration-200 ease-out border
                  ${isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary"
                    : isToday
                    ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
                    : "hover:bg-accent hover:border-accent-foreground/20"
                  }
                `}
              >
                <span className="text-[10px] uppercase font-medium opacity-75">
                  {dayName}
                </span>
                <span className="text-sm font-bold leading-none">{labelDay}</span>
              </Button>
            );
          })}
        </div>
      )}

    </div>
  );
}



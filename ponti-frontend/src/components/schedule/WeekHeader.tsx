"use client";

import { DayKey } from "@/data/types";

function getDayKeyByIndex(index: number): DayKey {
  const map: DayKey[] = ["L", "M", "X", "J", "V", "S"];
  return map[index] ?? "L";
}

function getIndexByDayKey(dayKey: DayKey): number {
  const map: Record<DayKey, number> = { L: 0, M: 1, X: 2, J: 3, V: 4, S: 5 };
  return map[dayKey];
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function WeekHeader({
  selectedDay,
  setSelectedDay,
  referenceMonday,
  setReferenceMonday,
}: {
  selectedDay: DayKey;
  setSelectedDay: (d: DayKey) => void;
  referenceMonday: Date; // Debe ser lunes de la semana mostrada
  setReferenceMonday: (d: Date) => void;
}) {
  const monthYear = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(referenceMonday);

  const today = new Date();
  const todayYMD = today.toDateString();
  const selectedIndex = getIndexByDayKey(selectedDay);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
        </p>
        <div className="flex items-center gap-2">
          <button
            aria-label="Semana anterior"
            onClick={() => setReferenceMonday(addDays(referenceMonday, -7))}
            className="h-8 w-8 rounded-md border"
          >
            ‹
          </button>
          <button
            aria-label="Semana siguiente"
            onClick={() => setReferenceMonday(addDays(referenceMonday, 7))}
            className="h-8 w-8 rounded-md border"
          >
            ›
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {Array.from({ length: 6 }).map((_, idx) => {
          const date = addDays(referenceMonday, idx);
          const labelDay = new Intl.DateTimeFormat("es-ES", {
            day: "numeric",
          }).format(date);
          const isSelected = idx === selectedIndex;
          const isToday = date.toDateString() === todayYMD;
          const dayKey = getDayKeyByIndex(idx);
          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(dayKey)}
              className={`flex flex-col items-center justify-center h-12 w-12 rounded-md border text-sm ${
                isSelected
                  ? "bg-foreground text-background"
                  : isToday
                  ? "ring-1 ring-foreground"
                  : ""
              }`}
            >
              <span className="text-[11px]">
                {dayKey}
              </span>
              <span className="leading-none">{labelDay}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}



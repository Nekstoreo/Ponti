"use client";

import { useScheduleStore } from "@/store/scheduleStore";
import { DayKey } from "@/data/types";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { List, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import { useState } from "react";
import ClassDetailCard from "@/components/schedule/ClassDetailCard";


export default function SchedulePage() {
  const schedule = useScheduleStore((s) => s.schedule);
  const selectedDay = useScheduleStore((s) => s.selectedDay);
  const setSelectedDay = useScheduleStore((s) => s.setSelectedDay);
  const searchParams = useSearchParams();
  const dayKeys: DayKey[] = ["D", "L", "M", "X", "J", "V", "S"];
  const [referenceMonday, setReferenceMonday] = useState(() => {
    // Obtener domingo de esta semana (asumiendo semana D-S)
    const now = new Date();
    const day = now.getDay(); // 0-6 (domingo=0)
    const deltaToSunday = -day; // días para ir al domingo
    const sunday = new Date(now);
    sunday.setHours(0, 0, 0, 0);
    sunday.setDate(now.getDate() + deltaToSunday);
    return sunday;
  });
  const [detailBlock, setDetailBlock] = useState<import("@/data/types").ClassBlock | null>(null);

  // Sincroniza el día seleccionado desde la query (?day=D|L|M|X|J|V|S)
  useEffect(() => {
    const day = searchParams.get("day");
    if (day && dayKeys.includes(day as DayKey)) {
      setSelectedDay(day as DayKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Desplaza la vista a la clase indicada por query (?class=<id>)
  useEffect(() => {
    const classId = searchParams.get("class");
    if (!classId) return;
    const el = document.getElementById(`class-${classId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedDay, searchParams]);

  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // helper functions for navigation
  function addDays(date: Date, days: number) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function getWeekStart(date: Date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    const newMonday = addDays(referenceMonday, days);
    setReferenceMonday(newMonday);
  };

  const jumpToToday = () => {
    const today = new Date();
    const todayWeekStart = getWeekStart(today);
    setReferenceMonday(todayWeekStart);
    const todayDayIndex = today.getDay();
    const map: Record<number, DayKey> = { 0: "D", 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S" };
    setSelectedDay(map[todayDayIndex] ?? 'D');
  };

  return (
    <div className="flex flex-col" style={{ height: '86vh' }}>
      {/* Top header: title + mode wrapper + navigation */}
      <div className="px-0 pt-0">
        <div className="flex items-center justify-between mb-4 px-4">
          <h1 className="text-xl font-semibold">Horario</h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 border rounded-md">
              <span className="text-sm text-muted-foreground">Modo:</span>
              <span className="font-medium text-sm">{viewMode === 'day' ? 'Día' : 'Semana'}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cambiar vista"
                onClick={() => setViewMode(viewMode === 'day' ? 'week' : 'day')}
                className="ml-2"
              >
                {viewMode === 'day' ? <List className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={jumpToToday} className="text-xs">
              Hoy
            </Button>
            <Button variant="outline" size="icon" aria-label="Semana anterior" onClick={() => navigateWeek('prev')} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Semana siguiente" onClick={() => navigateWeek('next')} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto overflow-x-hidden my-4">
        {(!schedule[selectedDay] || schedule[selectedDay]?.length === 0) ? (
          <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
            No tienes clases este día. ¡Tiempo para recargar energías!
          </div>
        ) : (
          <ScheduleTimeline
            viewMode={viewMode}
            blocks={schedule[selectedDay] || []}
            weeklySchedule={schedule}
            onBlockClick={(b) => {
              setDetailBlock(b);
            }}
            showNowLine={selectedDay === dayKeyFromToday() && !!schedule[selectedDay]?.length}
            onSwipeDay={(direction) => {
              // Handle swipe navigation between days
              const currentDayIndex = dayKeys.indexOf(selectedDay) ?? 0;
              let newDayIndex;

              if (direction === 'left') {
                // Swipe left - next day
                newDayIndex = (currentDayIndex + 1) % 7;
                // If we've reached the end of the week, advance to next week
                if (newDayIndex === 0) {
                  const nextWeek = new Date(referenceMonday);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setReferenceMonday(nextWeek);
                }
              } else {
                // Swipe right - previous day
                newDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
                // If we've reached the beginning of the week, go to previous week
                if (currentDayIndex === 0) {
                  const prevWeek = new Date(referenceMonday);
                  prevWeek.setDate(prevWeek.getDate() - 7);
                  setReferenceMonday(prevWeek);
                }
              }

              setSelectedDay(dayKeys[newDayIndex]);
            }}
          />
        )}
      </div>

      {/* Tarjeta de detalles fija en la parte inferior */}
      <div className="mt-auto">
        <ClassDetailCard block={detailBlock} />
      </div>
    </div>
  );
}

function dayKeyFromToday(): DayKey {
  const map: Record<number, DayKey> = { 0: "D", 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S" };
  const jsDay = new Date().getDay();
  return map[jsDay] ?? "D";
}



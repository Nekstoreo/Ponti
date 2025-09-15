"use client";

import { useScheduleStore } from "@/store/scheduleStore";
import { DayKey } from "@/data/types";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import { useState } from "react";
import ClassDetailCard from "@/components/schedule/ClassDetailCard";
import TimeNavigator from "@/components/schedule/WeekHeader";


export default function SchedulePage() {
  const schedule = useScheduleStore((s) => s.schedule);
  const selectedDay = useScheduleStore((s) => s.selectedDay);
  const setSelectedDay = useScheduleStore((s) => s.setSelectedDay);
  const searchParams = useSearchParams();
  const dayKeys: DayKey[] = ["D", "L", "M", "X", "J", "V", "S"];
  const [referenceMonday, setReferenceMonday] = useState(() => {
    // Obtener lunes de esta semana (primera función getWeekStart del TimeNavigator)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando el día es domingo
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
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

  return (
    <div className="flex flex-col" style={{ height: '86vh' }}>
      {/* Time Navigator - Header con navegación y selector de días */}
      <div className="px-4 pt-0 mb-4">
        <TimeNavigator
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          referenceMonday={referenceMonday}
          setReferenceMonday={setReferenceMonday}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      <div className={`flex-grow my-4 ${viewMode === 'week' ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
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
            referenceMonday={referenceMonday}
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



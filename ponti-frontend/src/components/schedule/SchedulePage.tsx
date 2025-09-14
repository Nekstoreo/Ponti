"use client";

import { useScheduleStore } from "@/store/scheduleStore";
import { DayKey } from "@/data/types";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import WeekHeader from "@/components/schedule/WeekHeader";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import { useState } from "react";
import ClassDetailCard from "@/components/schedule/ClassDetailCard";
import ScheduleExportModal from "@/components/schedule/ScheduleExportModal";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";


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
  const [exportModalOpen, setExportModalOpen] = useState(false);

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

  return (
    <div className="flex flex-col" style={{ height: '86vh' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Horario</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <WeekHeader
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        referenceMonday={referenceMonday}
        setReferenceMonday={setReferenceMonday}
        onSwipeDay={(direction) => {
          // Callback for swipe synchronization with timeline
          console.log("Week navigation via swipe:", direction);
        }}
      />

      <div className="flex-grow overflow-y-auto overflow-x-hidden my-4">
        {(!schedule[selectedDay] || schedule[selectedDay]?.length === 0) ? (
          <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
            No tienes clases este día. ¡Tiempo para recargar energías!
          </div>
        ) : (
          <ScheduleTimeline
            blocks={schedule[selectedDay] || []}
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

      <ScheduleExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        schedule={schedule}
      />
    </div>
  );
}

function dayKeyFromToday(): DayKey {
  const map: Record<number, DayKey> = { 0: "D", 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S" };
  const jsDay = new Date().getDay();
  return map[jsDay] ?? "D";
}



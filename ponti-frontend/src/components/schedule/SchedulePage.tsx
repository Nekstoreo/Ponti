"use client";

import { useScheduleStore } from "@/store/scheduleStore";
import { DayKey } from "@/data/types";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import WeekHeader from "@/components/schedule/WeekHeader";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import { useState } from "react";
import ClassDetailSheet from "@/components/schedule/ClassDetailSheet";

const dayLabels: Record<DayKey, string> = {
  L: "L",
  M: "M",
  X: "X",
  J: "J",
  V: "V",
  S: "S",
};

export default function SchedulePage() {
  const schedule = useScheduleStore((s) => s.schedule);
  const selectedDay = useScheduleStore((s) => s.selectedDay);
  const setSelectedDay = useScheduleStore((s) => s.setSelectedDay);
  const searchParams = useSearchParams();
  const [referenceMonday, setReferenceMonday] = useState(() => {
    // Obtener lunes de esta semana (asumiendo semana L-S)
    const now = new Date();
    const day = now.getDay(); // 0-6 (domingo=0)
    const deltaToMonday = day === 0 ? -6 : 1 - day; // si es domingo, ir 6 días atrás
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + deltaToMonday);
    return monday;
  });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBlock, setDetailBlock] = useState<import("@/data/types").ClassBlock | null>(null);

  // Sincroniza el día seleccionado desde la query (?day=L|M|X|J|V|S)
  useEffect(() => {
    const day = searchParams.get("day");
    const validDays: DayKey[] = ["L", "M", "X", "J", "V", "S"];
    if (day && validDays.includes(day as DayKey)) {
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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Horario</h1>

      <WeekHeader
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        referenceMonday={referenceMonday}
        setReferenceMonday={setReferenceMonday}
      />

      {schedule[selectedDay].length === 0 ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          No tienes clases este día. ¡Tiempo para recargar energías!
        </div>
      ) : (
        <ScheduleTimeline
          blocks={schedule[selectedDay]}
          onBlockClick={(b) => {
            setDetailBlock(b);
            setDetailOpen(true);
          }}
          showNowLine={selectedDay === dayKeyFromToday()}
        />
      )}

      <ClassDetailSheet open={detailOpen} onOpenChange={setDetailOpen} block={detailBlock} />
    </div>
  );
}

function dayKeyFromToday(): DayKey {
  const map: Record<number, DayKey> = { 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S" };
  const jsDay = new Date().getDay();
  return map[jsDay as 1 | 2 | 3 | 4 | 5 | 6] ?? "L";
}



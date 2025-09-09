"use client";

import { useScheduleStore } from "@/store/scheduleStore";
import { DayKey } from "@/data/types";

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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Horario</h1>

      <div className="grid grid-cols-6 gap-2">
        {(Object.keys(dayLabels) as DayKey[]).map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`h-10 rounded-md border text-sm ${
              selectedDay === d ? "bg-foreground text-background" : ""
            }`}
          >
            {dayLabels[d]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {schedule[selectedDay].length === 0 && (
          <p className="text-sm text-muted-foreground">No hay clases este día.</p>
        )}
        {schedule[selectedDay].map((b) => (
          <div key={b.id} className="rounded-md border p-3">
            <p className="font-medium">{b.courseName}</p>
            <p className="text-sm">{b.professor} • {b.room}</p>
            <p className="text-sm text-muted-foreground">{b.startTime} - {b.endTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
}



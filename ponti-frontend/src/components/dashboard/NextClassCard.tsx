"use client";

import { useScheduleStore } from "@/store/scheduleStore";

export function NextClassCard() {
  const nextClass = useScheduleStore((s) => s.getNextClassForToday());

  if (!nextClass) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">No tienes clases próximas.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4 space-y-1">
      <p className="text-xs text-muted-foreground">Próxima clase</p>
      <h2 className="text-lg font-medium">{nextClass.courseName}</h2>
      <p className="text-sm">{nextClass.professor} • {nextClass.room}</p>
      <p className="text-sm text-muted-foreground">
        {nextClass.startTime} - {nextClass.endTime}
      </p>
    </div>
  );
}



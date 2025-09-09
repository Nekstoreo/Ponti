"use client";

import { useScheduleStore } from "@/store/scheduleStore";
import { useRouter } from "next/navigation";

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function NextClassCard() {
  const schedule = useScheduleStore((s) => s.schedule);
  const selectedDay = useScheduleStore((s) => s.selectedDay);
  const router = useRouter();

  const blocks = schedule[selectedDay] ?? [];
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const inProgress = blocks.find(
    (b) => parseTimeToMinutes(b.startTime) <= nowMins && nowMins < parseTimeToMinutes(b.endTime)
  );
  const upcoming = blocks
    .filter((b) => parseTimeToMinutes(b.startTime) >= nowMins)
    .sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
  const nextClass = upcoming[0];

  if (blocks.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm font-medium">Día libre</p>
        <p className="text-sm text-muted-foreground">
          Hoy no tienes clases. Aprovecha para descansar o ponerte al día.
        </p>
      </div>
    );
  }

  if (!inProgress && !nextClass) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm font-medium">¡Buen trabajo!</p>
        <p className="text-sm text-muted-foreground">
          Has completado todas tus clases por hoy. ¡Disfruta el resto del día!
        </p>
      </div>
    );
  }

  const target = inProgress ?? nextClass!;
  const isInProgress = Boolean(inProgress);
  const deltaMins = isInProgress
    ? 0
    : parseTimeToMinutes(target.startTime) - nowMins;

  let pillLabel = "Próxima";
  let pillClass = "bg-secondary text-secondary-foreground";
  if (isInProgress) {
    pillLabel = "En curso";
    pillClass = "bg-green-500/15 text-green-700 dark:text-green-300";
  } else if (deltaMins < 60) {
    pillLabel = `En ${deltaMins} min`;
    pillClass = "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300";
  }

  return (
    <button
      onClick={() => router.push(`/horario?day=${selectedDay}&class=${target.id}`)}
      className="w-full text-left rounded-md border p-4 space-y-1 hover:bg-accent"
    >
      <div className="flex items-center gap-2">
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${pillClass}`}>{pillLabel}</span>
        <p className="text-xs text-muted-foreground">Tarjeta principal</p>
      </div>
      <h2 className="text-lg font-medium">{target.courseName}</h2>
      <p className="text-sm">{target.professor} • {target.room}</p>
      <p className="text-sm text-muted-foreground">
        {target.startTime} - {target.endTime}
      </p>
    </button>
  );
}



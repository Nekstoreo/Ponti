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

  // Estados sin clases activas: día libre o todas completadas
  if (blocks.length === 0 || (!inProgress && !nextClass)) {
    const isFreeDay = blocks.length === 0;
    const title = isFreeDay ? "Día libre" : "¡Buen trabajo!";
    const description = isFreeDay
      ? "Hoy no tienes clases. Aprovecha para descansar o ponerte al día."
      : "Has completado todas tus clases por hoy. ¡Disfruta el resto del día!";

    return (
      <div className="rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
          {title}
        </h2>
        <p className="text-sm text-green-600 dark:text-green-300 max-w-sm mx-auto leading-relaxed">
          {description}
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
      className="w-full text-left rounded-xl border bg-card hover:bg-accent/50 p-5 space-y-3 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${pillClass}`}>
          {pillLabel}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Próxima clase</span>
          <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          {target.courseName}
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{target.professor}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{target.room}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{target.startTime} - {target.endTime}</span>
        </div>
      </div>
    </button>
  );
}



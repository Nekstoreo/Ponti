"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSchedule } from "@/services/scheduleService";
import { fetchAnnouncements } from "@/services/announcementService";
import { useScheduleStore } from "@/store/scheduleStore";
import { useAnnouncementStore } from "@/store/announcementStore";
import { useAuthStore } from "@/store/authStore";
import { NextClassCard } from "@/components/dashboard/NextClassCard";
import { AnnouncementsList } from "@/components/dashboard/AnnouncementsList";

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function Dashboard() {
  const setSchedule = useScheduleStore((s) => s.setSchedule);
  const setAnnouncements = useAnnouncementStore((s) => s.setAnnouncements);
  const profile = useAuthStore((s) => s.userProfile);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [schedule, announcements] = await Promise.all([
        fetchSchedule(),
        fetchAnnouncements(),
      ]);
      setSchedule(schedule);
      setAnnouncements(announcements);
    } catch (e) {
      setError(
        "No se pudo cargar tu información. Parece que hay un problema de conexión."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = useMemo(() => {
    if (!profile?.fullName) return "Estudiante";
    const [name] = profile.fullName.split(" ");
    return name;
  }, [profile]);

  const dateLabel = useMemo(() => {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(
      now
    );
    const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
      now
    );
    return `${capitalizeFirst(weekday)}, ${now.getDate()} de ${month}`;
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Hola, {firstName}</h1>
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="rounded-md border p-4 animate-pulse bg-muted/50 h-[100px]" />
          <div className="space-y-2">
            <div className="rounded-md border p-4 animate-pulse bg-muted/50 h-[72px]" />
            <div className="rounded-md border p-4 animate-pulse bg-muted/50 h-[72px]" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-md border p-4 space-y-3">
          <div>
            <p className="font-medium">No se pudo cargar tu información</p>
            <p className="text-sm text-muted-foreground">
              Parece que hay un problema de conexión. Por favor, inténtalo de
              nuevo.
            </p>
          </div>
          <button
            onClick={load}
            className="h-9 px-3 rounded-md bg-foreground text-background w-fit"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <NextClassCard />
          <AnnouncementsList />
        </>
      )}
    </div>
  );
}



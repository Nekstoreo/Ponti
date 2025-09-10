"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSchedule } from "@/services/scheduleService";
import { fetchAnnouncements } from "@/services/announcementService";
import { useScheduleStore } from "@/store/scheduleStore";
import { useAnnouncementStore } from "@/store/announcementStore";
import { useAuthStore } from "@/store/authStore";
import { NextClassCard } from "@/components/dashboard/NextClassCard";
import { AnnouncementsList } from "@/components/dashboard/AnnouncementsList";
import PullToRefresh from "@/components/animations/PullToRefresh";
import { DashboardSkeleton } from "@/components/animations/LoadingSkeleton";
import { StaggeredAnimation } from "@/components/animations/PageTransition";

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function Dashboard() {
  const setSchedule = useScheduleStore((s) => s.setSchedule);
  const setAnnouncements = useAnnouncementStore((s) => s.setAnnouncements);
  const profile = useAuthStore((s) => s.userProfile);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    } catch {
      setError(
        "No se pudo cargar tu información. Parece que hay un problema de conexión."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setError(null);
    try {
      const [schedule, announcements] = await Promise.all([
        fetchSchedule(),
        fetchAnnouncements(),
      ]);
      setSchedule(schedule);
      setAnnouncements(announcements);
    } catch {
      setError(
        "No se pudo actualizar tu información. Parece que hay un problema de conexión."
      );
    } finally {
      setIsRefreshing(false);
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <PullToRefresh 
      onRefresh={handleRefresh}
      disabled={isRefreshing}
      className="min-h-[70vh]"
    >
      <div className="space-y-6">
        {/* Header with parallax effect */}
        <div 
          className="space-y-1 transition-transform duration-300 ease-out"
          style={{
            transform: isRefreshing ? 'translateY(5px)' : 'translateY(0)',
          }}
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Hola, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium text-destructive">No se pudo cargar tu información</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Parece que hay un problema de conexión. Por favor, inténtalo de nuevo.
            </p>
            <button
              onClick={load}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <StaggeredAnimation staggerDelay={150} className="space-y-6">
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <NextClassCard />
            </div>
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <AnnouncementsList />
            </div>
          </StaggeredAnimation>
        )}
      </div>
    </PullToRefresh>
  );
}



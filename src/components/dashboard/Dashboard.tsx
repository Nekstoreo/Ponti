"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSchedule } from "@/services/scheduleService";
import { fetchAnnouncements } from "@/services/announcementService";
import { useScheduleStore } from "@/store/scheduleStore";
import { useAnnouncementStore } from "@/store/announcementStore";
import { useAuthStore } from "@/store/authStore";
import { NextClassCard } from "@/components/dashboard/NextClassCard";
import { AnnouncementsList } from "@/components/dashboard/AnnouncementsList";
import { MascotCharacter } from "@/components/dashboard/MascotCharacter";
import { motion } from "framer-motion";
import { DashboardSkeleton } from "@/components/animations/LoadingSkeleton";
// import { StaggeredAnimation } from "@/components/animations/PageTransition";

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function Dashboard() {
  const setSchedule = useScheduleStore((s) => s.setSchedule);
  const setAnnouncements = useAnnouncementStore((s) => s.setAnnouncements);
  const profile = useAuthStore((s) => s.userProfile);

  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [schedule, announcements] = await Promise.all([
        fetchSchedule(),
        fetchAnnouncements(),
      ]);
      setSchedule(schedule);
      setAnnouncements(announcements);
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-[75vh] relative">
      {/* Background decorative mejorado */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute left-1/2 top-6 -translate-x-1/2 w-[500px] h-[500px] blur-3xl opacity-25 dark:opacity-15 bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)]" />
        {/* Segundo gradiente para mayor profundidad */}
        <div className="absolute right-1/4 bottom-1/3 w-[300px] h-[300px] blur-3xl opacity-15 dark:opacity-10 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />
      </div>

      <div className="space-y-6">
        {/* Hero Section mejorado */}
        <div className="relative flex flex-col items-center text-center gap-4 pt-1 pb-3">
          <MascotCharacter />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">
              Hola, <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">{firstName}</span>
            </h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span>{dateLabel}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="font-medium">Bienvenid@ de nuevo</span>
            </p>
          </div>
        </div>

        {/* Content blocks con mejor espaciado */}
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          >
            <NextClassCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="transform transition-all duration-300 hover:scale-[1.005] hover:shadow-md"
          >
            <AnnouncementsList />
          </motion.div>
        </div>
      </div>
    </div>
  );
}



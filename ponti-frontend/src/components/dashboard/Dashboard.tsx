"use client";

import { useEffect } from "react";
import { fetchSchedule } from "@/services/scheduleService";
import { fetchAnnouncements } from "@/services/announcementService";
import { useScheduleStore } from "@/store/scheduleStore";
import { useAnnouncementStore } from "@/store/announcementStore";
import { NextClassCard } from "@/components/dashboard/NextClassCard";
import { AnnouncementsList } from "@/components/dashboard/AnnouncementsList";

export default function Dashboard() {
  const setSchedule = useScheduleStore((s) => s.setSchedule);
  const setAnnouncements = useAnnouncementStore((s) => s.setAnnouncements);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [schedule, announcements] = await Promise.all([
        fetchSchedule(),
        fetchAnnouncements(),
      ]);
      if (!mounted) return;
      setSchedule(schedule);
      setAnnouncements(announcements);
    })();
    return () => {
      mounted = false;
    };
  }, [setSchedule, setAnnouncements]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Hoy</h1>
      <NextClassCard />
      <AnnouncementsList />
    </div>
  );
}



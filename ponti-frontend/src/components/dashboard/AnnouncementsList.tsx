"use client";

import { useAnnouncementStore } from "@/store/announcementStore";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnnouncementsList() {
  const router = useRouter();
  const items = useAnnouncementStore((s) => s.announcements);

  if (items.length === 0) {
    return null;
  }

  const recentItems = items.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Anuncios recientes</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/noticias")}
          className="text-xs flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-3">
        {recentItems.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            onClick={() => router.push(`/noticias/${announcement.id}`)}
            showActions={false}
          />
        ))}
      </div>
    </div>
  );
}



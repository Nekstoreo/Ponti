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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
          <h3 className="text-base font-semibold">Anuncios recientes</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/noticias")}
          className="text-xs flex items-center gap-1 hover:bg-accent/50 rounded-full px-3"
        >
          Ver todas
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-3">
        {recentItems.map((announcement, index) => (
          <div
            key={announcement.id}
            className="transform transition-all duration-200 hover:scale-[1.01]"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AnnouncementCard
              announcement={announcement}
              onClick={() => router.push(`/noticias/${announcement.id}`)}
              showActions={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}



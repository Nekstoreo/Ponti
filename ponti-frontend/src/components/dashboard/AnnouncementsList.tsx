"use client";

import { useAnnouncementStore } from "@/store/announcementStore";

export function AnnouncementsList() {
  const items = useAnnouncementStore((s) => s.announcements);
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium">Anuncios recientes</h3>
      <div className="space-y-2">
        {items.slice(0, 3).map((a) => (
          <div key={a.id} className="rounded-md border p-3">
            <p className="font-medium text-sm">{a.title}</p>
            <p className="text-sm text-muted-foreground">{a.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}



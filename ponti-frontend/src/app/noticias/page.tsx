"use client";

import MainLayout from "@/components/MainLayout";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";

export default function NoticiasPage() {

  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        <AnnouncementList />
      </div>
    </MainLayout>
  );
}

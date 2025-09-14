"use client";

import MainLayout from "@/components/MainLayout";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";
import { useRouter } from "next/navigation";

export default function NoticiasPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        <AnnouncementList />
      </div>
    </MainLayout>
  );
}

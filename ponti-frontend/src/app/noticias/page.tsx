import MainLayout from "@/components/MainLayout";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";

export default function NoticiasPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <AnnouncementList />
      </div>
    </MainLayout>
  );
}

import MainLayout from "@/components/MainLayout";
import OfflineSettings from "@/components/offline/OfflineSettings";

export default function ConfiguracionOfflinePage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <OfflineSettings />
      </div>
    </MainLayout>
  );
}

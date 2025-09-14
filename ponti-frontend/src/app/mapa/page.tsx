import MainLayout from "@/components/MainLayout";
import PageTitle from "@/components/PageTitle";
import MapPage from "@/components/map/MapPage";

export default function MapaRoute() {
  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-3 h-full" style={{ paddingBottom: 36 }}>
        <PageTitle title="Mapa" />
        <MapPage />
      </div>
    </MainLayout>
  );
}



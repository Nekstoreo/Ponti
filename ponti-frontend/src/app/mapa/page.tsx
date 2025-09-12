import MainLayout from "@/components/MainLayout";
import PageTitle from "@/components/PageTitle";
import MapPage from "@/components/map/MapPage";

export default function MapaRoute() {
  return (
    <MainLayout>
      <div className="space-y-3 h-full">
        <PageTitle title="Mapa" />
        <MapPage />
      </div>
    </MainLayout>
  );
}



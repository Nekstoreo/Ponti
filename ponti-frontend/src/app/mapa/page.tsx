import MainLayout from "@/components/MainLayout";
import MapPage from "@/components/map/MapPage";

export default function MapaRoute() {
  return (
    <MainLayout>
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Mapa</h1>
        <MapPage />
      </div>
    </MainLayout>
  );
}



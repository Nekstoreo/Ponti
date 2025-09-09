import MainLayout from "@/components/MainLayout";

export default function MapaRoute() {
  return (
    <MainLayout>
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Mapa</h1>
        <p className="text-sm text-muted-foreground">
          Vista del mapa del campus (placeholder).
        </p>
        <div className="aspect-video w-full rounded-md border bg-muted" />
      </div>
    </MainLayout>
  );
}



"use client";

import MainLayout from "@/components/MainLayout";
import SchedulePage from "@/components/schedule/SchedulePage";
// ...existing imports...

export default function HorarioRoute() {
  const now = new Date();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const monthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Horario</h1>
          <span className="text-sm text-muted-foreground">{monthYear}</span>
        </div>
        <SchedulePage />
      </div>
    </MainLayout>
  );
}



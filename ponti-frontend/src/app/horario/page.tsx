"use client";

import MainLayout from "@/components/MainLayout";
import SchedulePage from "@/components/schedule/SchedulePage";
// ...existing imports...

export default function HorarioRoute() {
  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Horario</h1>
        </div>
        <SchedulePage />
      </div>
    </MainLayout>
  );
}



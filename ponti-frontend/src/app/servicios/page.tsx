"use client";

import MainLayout from "@/components/MainLayout";
import { ServiceDirectory } from "@/components/services/ServiceDirectory";

export default function ServiciosPage() {

  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        <ServiceDirectory />
      </div>
    </MainLayout>
  );
}

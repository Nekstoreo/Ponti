"use client";

import MainLayout from "@/components/MainLayout";
import { ServiceDirectory } from "@/components/services/ServiceDirectory";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServiciosPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        <ServiceDirectory />
      </div>
    </MainLayout>
  );
}

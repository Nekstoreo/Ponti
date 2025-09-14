"use client";

import MainLayout from "@/components/MainLayout";
import WellnessSupportCenter from "@/components/wellness/WellnessSupportCenter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BienestarPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
        <WellnessSupportCenter />
      </div>
    </MainLayout>
  );
}

"use client";

import MainLayout from "@/components/MainLayout";
import WellnessSupportCenter from "@/components/wellness/WellnessSupportCenter";

export default function BienestarPage() {

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
        <WellnessSupportCenter />
      </div>
    </MainLayout>
  );
}

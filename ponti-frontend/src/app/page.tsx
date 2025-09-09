"use client";

import MainLayout from "@/components/MainLayout";
import Dashboard from "@/components/dashboard/Dashboard";
import dynamic from "next/dynamic";

const WelcomeOnboardingModal = dynamic(
  () => import("@/components/onboarding/WelcomeOnboardingModal"),
  { ssr: false }
);

export default function Home() {
  return (
    <MainLayout>
      <Dashboard />
      <WelcomeOnboardingModal />
    </MainLayout>
  );
}

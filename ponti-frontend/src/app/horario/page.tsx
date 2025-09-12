import MainLayout from "@/components/MainLayout";
import SchedulePage from "@/components/schedule/SchedulePage";

export default function HorarioRoute() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <SchedulePage />
      </div>
    </MainLayout>
  );
}



import MainLayout from "@/components/MainLayout";
import SchedulePage from "@/components/schedule/SchedulePage";

export default function HorarioRoute() {
  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        <SchedulePage />
      </div>
    </MainLayout>
  );
}



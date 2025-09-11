import MainLayout from "@/components/MainLayout";
import WellnessSupportCenter from "@/components/wellness/WellnessSupportCenter";

export default function BienestarPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
  <WellnessSupportCenter />
      </div>
    </MainLayout>
  );
}

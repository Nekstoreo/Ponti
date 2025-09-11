import MainLayout from "@/components/MainLayout";
import GradesList from "@/components/grades/GradesList";

export default function CalificacionesPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <GradesList />
      </div>
    </MainLayout>
  );
}

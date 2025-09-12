import MainLayout from "@/components/MainLayout";
import PageTitle from "@/components/PageTitle";
import GradesList from "@/components/grades/GradesList";

export default function CalificacionesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle title="Calificaciones" />
        <GradesList />
      </div>
    </MainLayout>
  );
}

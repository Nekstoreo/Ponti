import MainLayout from "@/components/MainLayout";
import PageTitle from "@/components/PageTitle";
import GradesList from "@/components/grades/GradesList";

export default function CalificacionesPage() {
  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
        <PageTitle title="Calificaciones" />
        <GradesList />
      </div>
    </MainLayout>
  );
}

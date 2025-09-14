"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { useGradeStore } from "@/store/gradeStore";
import GradeDetail from "@/components/grades/GradeDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSkeleton from "@/components/animations/LoadingSkeleton";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    courseGrades, 
    getCourseById, 
    isLoading, 
    initializeData 
  } = useGradeStore();

  const courseId = params.courseId as string;
  const course = getCourseById(courseId);

  useEffect(() => {
    if (courseGrades.length === 0) {
      initializeData();
    }
  }, [courseGrades.length, initializeData]);

  useEffect(() => {
    // Si no se encuentra el curso después de cargar los datos, redirigir
    if (courseGrades.length > 0 && !course) {
      const timer = setTimeout(() => {
        router.push("/calificaciones");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [course, courseGrades.length, router]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
          <div className="flex items-center gap-3">
            <LoadingSkeleton className="h-8 w-8 rounded" />
            <div className="flex-1">
              <LoadingSkeleton className="h-6 w-48 mb-2" />
              <LoadingSkeleton className="h-4 w-32" />
            </div>
            <LoadingSkeleton className="h-8 w-16" />
          </div>
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton variant="list" count={3} />
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="px-4 pt-4 space-y-4" style={{ paddingBottom: 36 }}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Materia no encontrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La materia que buscas no existe o no tienes acceso a ella.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Serás redirigido a la página de calificaciones en unos segundos...
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 pt-4" style={{ paddingBottom: 36 }}>
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Detalle de Materia</h1>
            <p className="text-sm text-muted-foreground">
              Información detallada y calificaciones
            </p>
          </div>
        </div>
        <GradeDetail course={course} />
      </div>
    </MainLayout>
  );
}

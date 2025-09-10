"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useGradeStore } from "@/store/gradeStore";
import GradeDetail from "@/components/grades/GradeDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="space-y-4">
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
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold">Calificaciones</h1>
        </div>
        
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
    );
  }

  return <GradeDetail course={course} />;
}

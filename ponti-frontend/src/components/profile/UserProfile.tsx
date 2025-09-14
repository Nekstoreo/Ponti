"use client";

import { UserProfile, AcademicInfo } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, MapPin, Calendar, GraduationCap, Award, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface UserProfileProps {
  user: UserProfile;
  academicInfo: AcademicInfo;
}

export function UserProfileComponent({ user, academicInfo }: UserProfileProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-yellow-100 text-yellow-800";
      case "graduated": return "bg-blue-100 text-blue-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Activo";
      case "inactive": return "Inactivo";
      case "graduated": return "Graduado";
      case "suspended": return "Suspendido";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con avatar y información principal */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="pt-6">
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-white shadow-lg">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <p className="text-gray-600 font-medium">{user.studentId}</p>
              <div className="flex justify-center">
                <Badge className={`${getStatusColor(academicInfo.academicStatus)} font-medium px-3 py-1`}>
                  {getStatusLabel(academicInfo.academicStatus)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Correo electrónico</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
              </div>
            )}

            {user.birthDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha de nacimiento</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(user.birthDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            )}

            {user.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">{user.address}</p>
                </div>
              </div>
            )}
          </div>

          {user.emergencyContact && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-3">Contacto de Emergencia</h3>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="font-medium">{user.emergencyContact.name}</p>
                  <p className="text-sm text-muted-foreground">{user.emergencyContact.relationship}</p>
                  <p className="text-sm text-muted-foreground">{user.emergencyContact.phone}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información Académica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Información Académica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Programa</p>
              <p className="text-sm text-muted-foreground">{academicInfo.program}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Facultad</p>
              <p className="text-sm text-muted-foreground">{academicInfo.faculty}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Semestre</p>
              <p className="text-sm text-muted-foreground">{academicInfo.semester}° semestre</p>
            </div>

            <div>
              <p className="text-sm font-medium">Fecha de admisión</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(academicInfo.admissionDate), "MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Promedio académico</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{academicInfo.gpa.toFixed(1)}</p>
                <Award className="h-4 w-4 text-yellow-500" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Créditos</p>
              <p className="text-sm text-muted-foreground">
                {academicInfo.completedCredits} / {academicInfo.totalCredits} completados
              </p>
            </div>
          </div>

          {/* Barra de progreso de créditos */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Progreso académico</span>
                <span className="text-sm font-bold text-primary">
                  {Math.round((academicInfo.completedCredits / academicInfo.totalCredits) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(academicInfo.completedCredits / academicInfo.totalCredits) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {academicInfo.completedCredits} de {academicInfo.totalCredits} créditos completados
              </p>
            </div>
          </div>

          {/* Botón para ver calificaciones */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/calificaciones")}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Ver calificaciones detalladas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

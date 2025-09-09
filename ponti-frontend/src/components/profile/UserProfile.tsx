"use client";

import { UserProfile, AcademicInfo } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, MapPin, Calendar, GraduationCap, Award, BookOpen, Edit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface UserProfileProps {
  user: UserProfile;
  academicInfo: AcademicInfo;
  onEdit?: () => void;
}

export function UserProfileComponent({ user, academicInfo, onEdit }: UserProfileProps) {
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
      {/* Header con avatar y acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="text-lg">
                  {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user.fullName}</h1>
                <p className="text-muted-foreground">{user.studentId}</p>
                <Badge className={getStatusColor(academicInfo.academicStatus)}>
                  {getStatusLabel(academicInfo.academicStatus)}
                </Badge>
              </div>
            </div>
            {onEdit && (
              <Button onClick={onEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar Perfil
              </Button>
            )}
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
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso académico</span>
              <span>{Math.round((academicInfo.completedCredits / academicInfo.totalCredits) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(academicInfo.completedCredits / academicInfo.totalCredits) * 100}%` }}
              />
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

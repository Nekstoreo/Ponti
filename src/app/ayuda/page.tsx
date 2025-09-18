"use client";

import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Info,
  HelpCircle,
  Mail,
  MessageSquare,
  Globe,
  BookOpen,
  Heart,
  Zap,
  Users,
  Smartphone
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AyudaPage() {
  const router = useRouter();

  const faqItems = [
    {
      question: "¿Cómo puedo ver mis calificaciones?",
      answer: "Ve a la sección 'Calificaciones' desde la barra inferior o desde el menú 'Más'. Ahí podrás ver todas tus notas por materia."
    },
    {
      question: "¿Cómo funciona el simulador de notas?",
      answer: "El simulador te permite proyectar tu nota final introduciendo las calificaciones que esperas obtener en las evaluaciones pendientes."
    },
    {
      question: "¿Dónde encuentro mi horario de clases?",
      answer: "Tu horario está disponible en la sección 'Horario' de la barra inferior. Incluye todas tus clases de la semana."
    },
    {
      question: "¿Cómo puedo usar la app sin conexión?",
      answer: "Ve a 'Configuración Offline' en el menú 'Más' para gestionar qué datos guardar para uso sin internet."
    },
    {
      question: "¿Dónde encuentro recursos de bienestar?",
      answer: "El Centro de Apoyo y Bienestar está disponible en el menú 'Más'. Incluye herramientas, contactos y tips diarios."
    }
  ];

  const supportContact = {
    name: "Soporte Técnico Ponti",
    description: "Ayuda con problemas técnicos de la aplicación",
    contact: "soporte@ponti.edu.co",
    icon: HelpCircle
  };

  return (
    <MainLayout>
      <div className="px-4 pt-4 space-y-6" style={{ paddingBottom: 36 }}>
        {/* Header con botón de regresar */}
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
            <h1 className="text-lg font-bold">Información y Soporte</h1>
            <p className="text-sm text-muted-foreground">
              Información sobre Ponti y opciones de soporte
            </p>
          </div>
        </div>

        {/* Sección Acerca de */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Acerca de Ponti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo y descripción */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">P</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Ponti</h2>
                <p className="text-muted-foreground">Tu compañero universitario inteligente</p>
                <Badge variant="secondary" className="mt-2">Versión 1.0.0</Badge>
              </div>
            </div>

            <Separator />

            {/* Descripción de la app */}
            <div className="space-y-4">
              <h3 className="font-semibold">¿Qué es Ponti?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ponti es la aplicación oficial de la universidad que te acompaña en tu jornada académica.
                Diseñada para estudiantes universitarios, te ofrece herramientas para gestionar tu horario,
                calificaciones, bienestar emocional y mucho más.
              </p>

              {/* Características principales */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Gestión académica</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>Bienestar estudiantil</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Herramientas inteligentes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Comunidad universitaria</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preguntas Frecuentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Preguntas Frecuentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-sm">{faq.question}</h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                {index < faqItems.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Soporte Técnico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Soporte Técnico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <h4 className="font-medium">{supportContact.name}</h4>
                <p className="text-sm text-muted-foreground">{supportContact.description}</p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{supportContact.contact}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recursos Disponibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Recursos Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Sitio Web Ponti</div>
                  <div className="text-sm text-muted-foreground">Información oficial de la plataforma</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Sistema de Información Académica</div>
                  <div className="text-sm text-muted-foreground">Portal estudiantil SIA de la universidad</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Técnica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Información Técnica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Versión</div>
                <div className="text-muted-foreground">1.0.0</div>
              </div>
              <div>
                <div className="font-medium">Última actualización</div>
                <div className="text-muted-foreground">Septiembre 2025</div>
              </div>
              <div>
                <div className="font-medium">Compatibilidad</div>
                <div className="text-muted-foreground">iOS 12+, Android 8+</div>
              </div>
              <div>
                <div className="font-medium">Desarrollado por</div>
                <div className="text-muted-foreground">Equipo Ponti</div>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                © 2025 Ponti. Todos los derechos reservados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Book, Calendar, Heart, Home, Info, LifeBuoy, Mail, MapPin, Phone, RefreshCw, Smile } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Tipos simples locales (podrían moverse a types.ts si se escalan)
interface SupportContact {
  id: string;
  type: 'psicologico' | 'medico' | 'orientacion' | 'emergencia' | 'general';
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  schedule?: string;
  extra?: string;
  tags?: string[];
  is24h?: boolean;
  priority?: 'high' | 'normal';
}

interface EmotionTool {
  id: string;
  title: string;
  description: string;
  actionText: string;
  category: 'estres' | 'ansiedad' | 'animo' | 'sueño' | 'foco';
  duration: string;
  steps: string[];
  icon: string;
}

interface DailyTip {
  id: string;
  text: string;
  category: string;
  icon: string;
}

const supportContacts: SupportContact[] = [
  {
    id: 'contact_cbu',
    type: 'psicologico',
    name: 'Centro de Bienestar Universitario',
    description: 'Apoyo psicológico, acompañamiento y promoción de la salud mental.',
    phone: '+57 601 123 4567',
    email: 'bienestar@universidad.edu',
    location: 'Edificio C, Piso 2',
    schedule: 'Lunes a Viernes 8:00 - 17:00',
    tags: ['psicología', 'salud mental', 'apoyo'],
  },
  {
    id: 'contact_psico_urg',
    type: 'emergencia',
    name: 'Línea de Atención Psicológica 24/7',
    description: 'Soporte emocional inmediato y confidencial.',
    phone: '018000-000-911',
    is24h: true,
    priority: 'high',
    tags: ['emergencia', 'crisis', '24h'],
  },
  {
    id: 'contact_medico',
    type: 'medico',
    name: 'Servicio Médico Universitario',
    description: 'Atención primaria y orientación médica para estudiantes.',
    phone: '+57 601 555 7890',
    email: 'medico@universidad.edu',
    location: 'Bloque Salud, Planta Baja',
    schedule: 'Lunes a Sábado 7:00 - 19:00',
    tags: ['salud', 'medicina'],
  },
  {
    id: 'contact_orientacion',
    type: 'orientacion',
    name: 'Orientación Académica y Vocacional',
    description: 'Apoyo en decisiones académicas y manejo del estrés académico.',
    email: 'orientacion@universidad.edu',
    schedule: 'Citas programadas',
    tags: ['estrés', 'estudios', 'vocación'],
  },
  {
    id: 'contact_seguridad',
    type: 'emergencia',
    name: 'Seguridad Campus',
    description: 'Atención a incidentes dentro del campus.',
    phone: '+57 601 777 0000',
    is24h: true,
    tags: ['seguridad', 'emergencia'],
  }
];

const emotionTools: EmotionTool[] = [
  {
    id: 'tool_respiracion',
    title: 'Respiración 4-7-8',
    description: 'Técnica breve para reducir ansiedad y regular el sistema nervioso.',
    actionText: 'Iniciar',
    category: 'ansiedad',
    duration: '2-3 min',
    icon: '🧘‍♂️',
    steps: [
      'Inhala por la nariz contando 4',
      'Mantén la respiración contando 7',
      'Exhala lentamente por la boca contando 8',
      'Repite el ciclo 4 veces'
    ]
  },
  {
    id: 'tool_relajacion',
    title: 'Relajación Progresiva',
    description: 'Libera tensión alternando contracción y relajación muscular.',
    actionText: 'Practicar',
    category: 'estres',
    duration: '5 min',
    icon: '🌿',
    steps: [
      'Aprieta los músculos de pies y pantorrillas 5 segundos',
      'Relaja y siente la diferencia',
      'Sube a muslos, abdomen, hombros y mandíbula',
      'Respira lento entre cada grupo'
    ]
  },
  {
    id: 'tool_enfoque',
    title: 'Técnica Pomodoro Suave',
    description: 'Enfócate 25 min y descansa 5 con estiramientos y respiración.',
    actionText: 'Empezar',
    category: 'foco',
    duration: '30 min',
    icon: '⏳',
    steps: [
      'Define una tarea clara',
      'Trabaja 25 min sin distracciones',
      'Descansa 5 min: muévete y respira',
      'Tras 4 ciclos, toma un descanso largo'
    ]
  },
  {
    id: 'tool_sueno',
    title: 'Higiene del Sueño Express',
    description: 'Mini chequeo rápido para mejorar la calidad de tu descanso.',
    actionText: 'Revisar',
    category: 'sueño',
    duration: '2 min',
    icon: '😴',
    steps: [
      'Evita pantallas 30 min antes de dormir',
      'Ambiente oscuro y fresco',
      'Cena ligera y evita cafeína tarde',
      'Hora de dormir consistente'
    ]
  },
  {
    id: 'tool_animo',
    title: 'Micro Gratitud',
    description: 'Ejercicio rápido para elevar el estado de ánimo.',
    actionText: 'Reflexionar',
    category: 'animo',
    duration: '3 min',
    icon: '💛',
    steps: [
      'Piensa en 3 cosas que agradeces hoy',
      'Escríbelas en una nota o app',
      'Léelas en voz alta',
      'Respira profundo y continúa'
    ]
  }
];

const dailyTips: DailyTip[] = [
  { id: 'tip_hidratacion', text: 'La deshidratación leve reduce tu concentración. Bebe un vaso de agua ahora.', category: 'energía', icon: '💧' },
  { id: 'tip_pausa_visual', text: 'Mira a 20 metros durante 20 segundos cada 20 minutos (Regla 20-20-20).', category: 'foco', icon: '👀' },
  { id: 'tip_respira', text: 'Tres respiraciones profundas reducen el cortisol en minutos.', category: 'estrés', icon: '🌬️' },
  { id: 'tip_conexion', text: 'Escribe un mensaje a un amigo: la conexión social amortigua el estrés.', category: 'ánimo', icon: '💬' },
  { id: 'tip_sueno', text: 'Dormir menos de 7h afecta memoria y regulación emocional.', category: 'sueño', icon: '🛌' }
];

const emergencyAdvice = [
  'Si experimentas pensamientos de autolesión busca ayuda inmediata: llama a la línea de emergencia o acude a un adulto de confianza.',
  'No te aísles: compartir lo que sientes reduce la carga emocional.',
  'Si sientes un ataque de pánico: enfoca tu atención en 5 cosas que ves, 4 que puedes tocar, 3 que puedes oír, 2 que puedes oler y 1 que puedes saborear.'
];

export default function WellnessSupportCenter() {
  const [activeTab, setActiveTab] = useState<'recursos' | 'herramientas' | 'emergencia'>('recursos');
  const [showTool, setShowTool] = useState<EmotionTool | null>(null);
  const [tip, setTip] = useState<DailyTip | null>(null);

  useEffect(() => {
    // Seleccionar tip diario determinístico por fecha
    const today = new Date();
    const index = today.getDate() % dailyTips.length;
    setTip(dailyTips[index]);
  }, []);

  const groupedContacts = useMemo(() => {
    return supportContacts.reduce<Record<string, SupportContact[]>>((acc, c) => {
      acc[c.type] = acc[c.type] || [];
      acc[c.type].push(c);
      return acc;
    }, {});
  }, []);

  const renderContact = (c: SupportContact) => {
    return (
      <Card key={c.id} className={`relative overflow-hidden border-l-4 ${c.priority === 'high' ? 'border-l-red-500' : 'border-l-green-500'}`}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm flex items-center gap-2">{c.name} {c.is24h && <Badge className="text-[10px]" variant="outline">24h</Badge>}</h3>
              {c.description && <p className="text-xs text-muted-foreground line-clamp-3">{c.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
            {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
            {c.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>}
            {c.schedule && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.schedule}</span>}
          </div>
          {c.tags && (
            <div className="flex flex-wrap gap-1">
              {c.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTool = (tool: EmotionTool) => (
    <Card key={tool.id} className="hover:shadow-sm transition cursor-pointer" onClick={() => setShowTool(tool)}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="text-2xl" aria-hidden>{tool.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-1">{tool.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline" className="text-[10px]">{tool.duration}</Badge>
              <span className="text-[11px] text-muted-foreground capitalize">{tool.category}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Centro de Apoyo y Bienestar</h1>
            <p className="text-sm text-muted-foreground">Recursos, contactos y herramientas para tu salud integral</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setTip(dailyTips[Math.floor(Math.random()*dailyTips.length)])} className="gap-1">
            <RefreshCw className="w-3 h-3" /> Tip
          </Button>
        </div>

        {/* Daily Tip */}
        {tip && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="text-2xl" aria-hidden>{tip.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">Tip del día • {tip.category}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.text}</p>
              </div>
            </CardContent>
          </Card>
        )}

  <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'recursos' | 'herramientas' | 'emergencia')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recursos" className="text-xs">
              <LifeBuoy className="w-4 h-4 mr-1" /> Recursos
            </TabsTrigger>
            <TabsTrigger value="herramientas" className="text-xs">
              <Heart className="w-4 h-4 mr-1" /> Herramientas
            </TabsTrigger>
            <TabsTrigger value="emergencia" className="text-xs">
              <AlertTriangle className="w-4 h-4 mr-1" /> Emergencia
            </TabsTrigger>
          </TabsList>

          {/* Recursos */}
          <TabsContent value="recursos" className="space-y-4 mt-4">
            <div className="space-y-6">
              {Object.entries(groupedContacts).map(([type, contacts]) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {type === 'psicologico' && <Smile className="w-4 h-4 text-pink-600" />}
                    {type === 'medico' && <Home className="w-4 h-4 text-blue-600" />}
                    {type === 'orientacion' && <Book className="w-4 h-4 text-amber-600" />}
                    {type === 'emergencia' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <h2 className="text-sm font-semibold capitalize">{type}</h2>
                  </div>
                  <div className="space-y-3">
                    {contacts.map(renderContact)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Herramientas */}
          <TabsContent value="herramientas" className="space-y-4 mt-4">
            <p className="text-xs text-muted-foreground">Ejercicios rápidos de autorregulación emocional y hábitos saludables.</p>
            <div className="grid grid-cols-1 gap-3">
              {emotionTools.map(renderTool)}
            </div>
          </TabsContent>

          {/* Emergencia */}
          <TabsContent value="emergencia" className="space-y-4 mt-4">
            <Card className="border-red-300 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700"><AlertTriangle className="w-4 h-4" /> Ayuda Inmediata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <p className="text-xs text-red-700">Si tú o alguien está en peligro inmediato, busca ayuda presencial o llama a un servicio de emergencias.</p>
                <div className="space-y-2">
                  {emergencyAdvice.map(a => (
                    <div key={a} className="flex items-start gap-2 text-xs text-red-800">
                      <Info className="w-3 h-3 mt-0.5" /> {a}
                    </div>
                  ))}
                </div>
                <Separator className="bg-red-200" />
                <div className="grid grid-cols-1 gap-2">
                  {supportContacts.filter(c => c.type === 'emergencia').map(c => (
                    <Button key={c.id} size="sm" variant="destructive" className="justify-start gap-2">
                      <Phone className="w-3 h-3" /> {c.name} {c.phone && `• ${c.phone}`}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal simple inline para herramienta seleccionada */}
        {showTool && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowTool(null)}>
            <div className="bg-background rounded-lg w-full max-w-md shadow-lg animate-in slide-in-from-bottom-4 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl" aria-hidden>{showTool.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{showTool.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{showTool.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px]">{showTool.duration}</Badge>
                      <Badge className="text-[10px] capitalize">{showTool.category}</Badge>
                    </div>
                  </div>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                  {showTool.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowTool(null)}>Cerrar</Button>
                  <Button size="sm">Hecho</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

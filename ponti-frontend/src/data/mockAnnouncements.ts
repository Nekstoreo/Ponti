import { AnnouncementItem } from "./types";

export const mockAnnouncements: AnnouncementItem[] = [
  {
    id: "a_1",
    title: "Inscripciones abiertas para Semana de Innovación",
    summary:
      "Participa en charlas y talleres. Cupos limitados. Regístrate antes del viernes.",
    content: "La Universidad Ponti invita a todos los estudiantes a participar en la Semana de Innovación 2024. Durante esta semana tendremos charlas magistrales con expertos en tecnología, talleres prácticos de desarrollo de software, y sesiones de networking con empresas del sector. Los cupos son limitados, por lo que te recomendamos registrarte lo antes posible. Las actividades se llevarán a cabo en el Auditorio Principal del Campus Central.",
    category: "eventos",
    createdAt: new Date().toISOString(),
    isRead: false,
    isImportant: true,
    author: "Dirección de Innovación",
    tags: ["innovación", "tecnología", "networking"]
  },
  {
    id: "a_2",
    title: "Mantenimiento de la plataforma el sábado",
    summary:
      "El sistema estará inactivo de 2:00 a 4:00 AM por mejoras de infraestructura.",
    content: "Informamos que este sábado realizaremos mantenimiento programado en nuestros sistemas académicos. El servicio estará temporalmente inactivo desde las 2:00 AM hasta las 4:00 AM. Durante este periodo no será posible acceder al portal estudiantil, sistema de calificaciones, ni realizar trámites en línea. Recomendamos planificar tus actividades académicas considerando este horario. Disculpen las molestias que esto pueda ocasionar.",
    category: "administrativo",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
    isImportant: false,
    author: "Departamento de TI",
    tags: ["mantenimiento", "sistema", "ti"]
  },
  {
    id: "a_3",
    title: "Nuevo horario de biblioteca",
    summary:
      "La biblioteca central extiende su horario de atención hasta las 10:00 PM de lunes a viernes.",
    content: "Nos complace anunciar que a partir de la próxima semana, la Biblioteca Central de la Universidad Ponti extenderá su horario de atención. Los nuevos horarios serán: Lunes a Viernes de 7:00 AM a 10:00 PM, Sábados de 8:00 AM a 6:00 PM, y Domingo de 10:00 AM a 4:00 PM. Esta ampliación del horario responde a las necesidades de nuestros estudiantes que requieren espacios de estudio adicionales durante las noches. También hemos incrementado el número de computadoras disponibles y mejorado el acceso WiFi.",
    category: "academico",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isRead: false,
    isImportant: false,
    author: "Dirección de Biblioteca",
    tags: ["biblioteca", "horarios", "estudio"]
  },
  {
    id: "a_4",
    title: "Convocatoria becas de investigación",
    summary:
      "Abierta la convocatoria para becas de investigación 2024. Plazo hasta el 15 de marzo.",
    content: "La Vicerrectoría de Investigación abre la convocatoria para becas de investigación 2024. Esta oportunidad está dirigida a estudiantes de pregrado y posgrado que deseen desarrollar proyectos de investigación en las diferentes áreas del conocimiento. Las becas cubren materiales, equipo, y en algunos casos, apoyo económico mensual. Los proyectos seleccionados recibirán tutoría especializada y tendrán la posibilidad de publicar sus resultados. El plazo de postulación es hasta el 15 de marzo. Para más información, visita la página web de investigación o contacta al departamento correspondiente.",
    category: "academico",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    isRead: false,
    isImportant: true,
    author: "Vicerrectoría de Investigación",
    tags: ["becas", "investigación", "convocatoria"]
  },
  {
    id: "a_5",
    title: "Día de la Salud Mental",
    summary:
      "Actividades gratuitas de bienestar psicológico disponibles todo el día en el Centro de Estudiantes.",
    content: "Con motivo del Día Mundial de la Salud Mental, la Universidad Ponti organiza una jornada completa de actividades en el Centro de Estudiantes. Tendremos disponibles consultas psicológicas gratuitas, talleres de manejo del estrés, sesiones de mindfulness, y charlas informativas sobre salud mental. Los servicios estarán disponibles desde las 8:00 AM hasta las 8:00 PM. No se requiere cita previa, pero recomendamos llegar temprano ya que los cupos son limitados. Esta actividad es gratuita para toda la comunidad universitaria.",
    category: "eventos",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    isRead: true,
    isImportant: false,
    author: "Centro de Bienestar Estudiantil",
    tags: ["salud mental", "bienestar", "talleres"]
  }
];



import { AnnouncementItem } from "./types";

export const mockAnnouncements: AnnouncementItem[] = [
  {
    id: "a_1",
    title: "Inscripciones abiertas para Semana de Innovación",
    summary:
      "Participa en charlas y talleres. Cupos limitados. Regístrate antes del viernes.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "a_2",
    title: "Mantenimiento de la plataforma el sábado",
    summary:
      "El sistema estará inactivo de 2:00 a 4:00 AM por mejoras de infraestructura.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];



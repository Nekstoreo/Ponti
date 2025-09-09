import { NotificationItem, NotificationSettings } from "./types";

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif_1",
    type: "class_reminder",
    title: "Recordatorio de clase",
    message: "Tu clase de Matemáticas Discretas comienza en 15 minutos en el salón 201.",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
    isImportant: true,
    classData: {
      courseName: "Matemáticas Discretas",
      room: "Salón 201",
      startTime: "08:00",
    },
    actionUrl: "/horario",
    expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
  },
  {
    id: "notif_2",
    type: "announcement",
    title: "Nuevo anuncio importante",
    message: "Se ha publicado un anuncio sobre el mantenimiento programado del sistema.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
    isImportant: true,
    announcementData: {
      announcementId: "a_2",
      category: "administrativo",
    },
    actionUrl: "/noticias/a_2",
  },
  {
    id: "notif_3",
    type: "schedule_change",
    title: "Cambio en el horario",
    message: "La clase de Programación Web del viernes ha sido movida al salón 305.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    isRead: true,
    isImportant: false,
    actionUrl: "/horario",
  },
  {
    id: "notif_4",
    type: "service_update",
    title: "Actualización de horario de servicios",
    message: "El Centro de Computo ahora está abierto hasta las 10:00 PM de lunes a viernes.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    isRead: true,
    isImportant: false,
    actionUrl: "/servicios/serv_3",
  },
  {
    id: "notif_5",
    type: "general",
    title: "Actualización de la app",
    message: "Ponti ha sido actualizado con nuevas funcionalidades. Explora el directorio de servicios.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
    isImportant: false,
    actionUrl: "/servicios",
  },
  {
    id: "notif_6",
    type: "class_reminder",
    title: "Recordatorio de clase",
    message: "Tu clase de Bases de Datos comienza en 15 minutos en el laboratorio 4.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    isRead: true,
    isImportant: true,
    classData: {
      courseName: "Bases de Datos",
      room: "Laboratorio 4",
      startTime: "10:00",
    },
    actionUrl: "/horario",
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export const defaultNotificationSettings: NotificationSettings = {
  classReminders: {
    enabled: true,
    minutesBefore: 15,
  },
  announcements: {
    enabled: true,
    importantOnly: false,
  },
  scheduleChanges: {
    enabled: true,
  },
  serviceUpdates: {
    enabled: true,
  },
  general: {
    enabled: true,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

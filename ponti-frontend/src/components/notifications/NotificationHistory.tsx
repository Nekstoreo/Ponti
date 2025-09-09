"use client";

import { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationItem } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Clock,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Trash2,
  CheckCheck,
  History
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const typeIcons = {
  class_reminder: Clock,
  announcement: Bell,
  schedule_change: AlertTriangle,
  service_update: Info,
  general: Bell,
};

const typeLabels = {
  class_reminder: "Recordatorio de clase",
  announcement: "Anuncio",
  schedule_change: "Cambio de horario",
  service_update: "Actualización de servicio",
  general: "General",
};

const typeColors = {
  class_reminder: "bg-blue-100 text-blue-800",
  announcement: "bg-orange-100 text-orange-800",
  schedule_change: "bg-red-100 text-red-800",
  service_update: "bg-green-100 text-green-800",
  general: "bg-gray-100 text-gray-800",
};

interface NotificationHistoryProps {
  maxItems?: number;
}

export function NotificationHistory({ maxItems }: NotificationHistoryProps) {
  const router = useRouter();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearExpiredNotifications,
  } = useNotificationStore();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    // Limpiar notificaciones expiradas al cargar
    clearExpiredNotifications();
  }, [clearExpiredNotifications]);

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === "unread") return !notification.isRead;
      if (filter === "read") return notification.isRead;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxItems);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
          <p className="text-muted-foreground text-center">
            Cuando recibas notificaciones aparecerán aquí
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con filtros y acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Notificaciones
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {unreadCount} sin leer
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Todas ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Sin leer ({unreadCount})
              </Button>
              <Button
                variant={filter === "read" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("read")}
              >
                Leídas ({notifications.length - unreadCount})
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas como leídas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeColors[notification.type]}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${typeColors[notification.type]}`}
                              >
                                {typeLabels[notification.type]}
                              </Badge>
                              {notification.isImportant && (
                                <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                                  Importante
                                </Badge>
                              )}
                              {!notification.isRead && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                            </div>

                            <h4 className={`font-medium text-sm leading-tight ${
                              notification.isRead ? "text-muted-foreground" : ""
                            }`}>
                              {notification.title || "Notificación"}
                            </h4>

                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </span>
                              {notification.expiresAt && (
                                <span>
                                  • Expira: {formatDistanceToNow(new Date(notification.expiresAt), {
                                    addSuffix: true,
                                    locale: es,
                                  })}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === "unread" ? "No hay notificaciones sin leer" :
               filter === "read" ? "No hay notificaciones leídas" :
               "No hay notificaciones"}
            </h3>
            <p className="text-muted-foreground text-center">
              {filter === "unread" ? "Todas las notificaciones han sido leídas" :
               filter === "read" ? "No has leído ninguna notificación aún" :
               "Cuando recibas notificaciones aparecerán aquí"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

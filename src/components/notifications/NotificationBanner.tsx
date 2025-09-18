"use client";

import { useState, useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationItem } from "@/data/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, Clock, AlertTriangle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationBannerProps {
  notification: NotificationItem;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number; // en milisegundos
}

const typeIcons = {
  class_reminder: Clock,
  announcement: Bell,
  schedule_change: AlertTriangle,
  service_update: Info,
  general: Bell,
};

const typeColors = {
  class_reminder: "bg-blue-100 text-blue-800 border-blue-200",
  announcement: "bg-orange-100 text-orange-800 border-orange-200",
  schedule_change: "bg-red-100 text-red-800 border-red-200",
  service_update: "bg-green-100 text-green-800 border-green-200",
  general: "bg-gray-100 text-gray-800 border-gray-200",
};

export function NotificationBanner({
  notification,
  onDismiss,
  autoHide = true,
  autoHideDelay = 10000
}: NotificationBannerProps) {
  const router = useRouter();
  const { markAsRead } = useNotificationStore();
  const [isVisible, setIsVisible] = useState(true);

  const Icon = typeIcons[notification.type];

  useEffect(() => {
    if (autoHide && !notification.isImportant) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, notification.isImportant, onDismiss]);

  const handleAction = () => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    markAsRead(notification.id);
    onDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <Card className={`border-l-4 ${typeColors[notification.type]} shadow-lg animate-in slide-in-from-top-2`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm leading-tight">
                  {notification.title || "Notificación"}
                </h4>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {notification.isImportant && (
                  <Badge variant="secondary" className="text-xs">
                    Importante
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>

              <div className="flex gap-2">
                {notification.actionUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAction}
                    className="text-xs"
                  >
                    Ver más
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    markAsRead(notification.id);
                    handleDismiss();
                  }}
                  className="text-xs"
                >
                  Marcar como leído
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

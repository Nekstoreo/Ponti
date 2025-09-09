"use client";

import { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationBanner } from "./NotificationBanner";
import { NotificationItem } from "@/data/types";

export function NotificationManager() {
  const { getUnreadNotifications } = useNotificationStore();
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unreadNotifications = getUnreadNotifications();

    // Filtrar notificaciones importantes que no se hayan mostrado aún
    const importantUnreadNotifications = unreadNotifications.filter(
      notification =>
        notification.isImportant &&
        !shownNotifications.has(notification.id)
    );

    // Si hay notificaciones importantes sin mostrar, mostrar la primera
    if (importantUnreadNotifications.length > 0 && !currentNotification) {
      const notificationToShow = importantUnreadNotifications[0];
      setCurrentNotification(notificationToShow);
      setShownNotifications(prev => new Set([...prev, notificationToShow.id]));
    }
  }, [getUnreadNotifications, currentNotification, shownNotifications]);

  const handleDismiss = () => {
    setCurrentNotification(null);
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
      <NotificationBanner
        notification={currentNotification}
        onDismiss={handleDismiss}
        autoHide={true}
        autoHideDelay={8000}
      />
    </div>
  );
}

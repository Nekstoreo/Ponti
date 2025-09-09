"use client";

import { useNotificationStore } from "@/store/notificationStore";
import { Badge } from "@/components/ui/badge";

interface NotificationIndicatorProps {
  children: React.ReactNode;
  className?: string;
}

export function NotificationIndicator({ children, className }: NotificationIndicatorProps) {
  const { unreadCount } = useNotificationStore();

  return (
    <div className={`relative ${className}`}>
      {children}
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-0"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </div>
  );
}

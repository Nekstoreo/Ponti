"use client";

import { NotificationItem } from "@/data/types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import { formatDistanceToNow, addMinutes } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: NotificationItem | null;
}

export default function NotificationActionModal({
  open,
  onOpenChange,
  notification,
}: NotificationActionModalProps) {
  const router = useRouter();
  const { markAsRead, markAsImportant, deleteNotification, snoozeNotification } = useNotificationStore();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  // Reset translation when modal opens/closes
  useEffect(() => {
    if (open) {
      setTranslateY(0);
      setShowSnoozeOptions(false);
    }
  }, [open]);

  if (!open || !notification) return null;

  // Handle touch/mouse events for swipe to close
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setTranslateY(0);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    
    const deltaY = clientY - startY;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (translateY > 100) {
      onOpenChange(false);
    } else {
      setTranslateY(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientY);
  };

  // Get type-specific content
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'class_reminder':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'announcement':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case 'schedule_change':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'service_update':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 5v5a4 4 0 004 4h3m-3-8l-1-1v-2a2 2 0 012-2h2a2 2 0 012 2v2L9 5H4z" />
          </svg>
        );
    }
  };

  const getTypeColorClass = (type: string) => {
    switch (type) {
      case 'class_reminder': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'announcement': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'schedule_change': return 'text-red-600 bg-red-50 border-red-200';
      case 'service_update': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'class_reminder': return 'Recordatorio de clase';
      case 'announcement': return 'Anuncio';
      case 'schedule_change': return 'Cambio de horario';
      case 'service_update': return 'Actualización de servicio';
      default: return 'General';
    }
  };

  // Action handlers
  const handleMarkAsRead = () => {
    markAsRead(notification.id);
    onOpenChange(false);
  };

  const handleMarkAsImportant = () => {
    markAsImportant(notification.id, !notification.isImportant);
  };

  const handleNavigateToContent = () => {
    if (notification.actionUrl) {
      markAsRead(notification.id);
      onOpenChange(false);
      router.push(notification.actionUrl);
    }
  };

  const handleSnooze = (minutes: number) => {
    const snoozeUntil = addMinutes(new Date(), minutes);
    snoozeNotification(notification.id, snoozeUntil.toISOString());
    setShowSnoozeOptions(false);
    onOpenChange(false);
  };

  const handleDelete = () => {
    deleteNotification(notification.id);
    onOpenChange(false);
  };

  // Get contextual actions based on notification type
  const getContextualActions = () => {
    switch (notification.type) {
      case 'class_reminder':
        return [
          {
            label: 'Ver Horario',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            action: () => {
              markAsRead(notification.id);
              onOpenChange(false);
              router.push('/horario');
            },
            variant: 'primary' as const
          },
          {
            label: 'Ubicar Aula',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            action: () => {
              if (notification.classData?.room) {
                markAsRead(notification.id);
                onOpenChange(false);
                // Generate POI id from room info
                const buildingMatch = notification.classData.room.match(/bloque\s*(\d+)/i);
                const poiId = buildingMatch ? `poi_bloque_${buildingMatch[1]}` : 'poi_lib';
                router.push(`/mapa?poi=${poiId}`);
              }
            },
            variant: 'secondary' as const
          }
        ];
      case 'announcement':
        return [
          {
            label: 'Leer Anuncio',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
            action: handleNavigateToContent,
            variant: 'primary' as const
          }
        ];
      case 'service_update':
        return [
          {
            label: 'Ver Servicio',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
              </svg>
            ),
            action: () => {
              markAsRead(notification.id);
              onOpenChange(false);
              router.push('/servicios');
            },
            variant: 'primary' as const
          }
        ];
      default:
        return notification.actionUrl ? [
          {
            label: 'Ver Más',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            ),
            action: handleNavigateToContent,
            variant: 'primary' as const
          }
        ] : [];
    }
  };

  const contextualActions = getContextualActions();
  const canSnooze = notification.type === 'class_reminder' && !notification.isRead;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
      onClick={() => onOpenChange(false)}
    >
      <div
        ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 mx-auto max-w-md rounded-t-xl border bg-background shadow-xl transition-transform duration-300 ease-out overflow-hidden"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {/* Drag handle */}
        <div className="w-full py-3 cursor-grab active:cursor-grabbing">
          <div className="h-1 w-12 bg-muted mx-auto rounded-full" />
        </div>
        
        {/* Content */}
        <div className="p-4 pb-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getTypeColorClass(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColorClass(notification.type)}`}>
                      {getTypeLabel(notification.type)}
                    </span>
                    {notification.isImportant && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Importante
                      </span>
                    )}
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {notification.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Message content */}
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm leading-relaxed">{notification.message}</p>
              
              {/* Additional context for class reminders */}
              {notification.classData && (
                <div className="mt-3 pt-3 border-t border-muted">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-muted-foreground">{notification.classData.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-muted-foreground">{notification.classData.room}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Snooze options */}
            {showSnoozeOptions && canSnooze && (
              <div className="bg-muted/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-3">Posponer recordatorio</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '5 min', minutes: 5 },
                    { label: '10 min', minutes: 10 },
                    { label: '15 min', minutes: 15 },
                    { label: '30 min', minutes: 30 },
                  ].map((option) => (
                    <button
                      key={option.minutes}
                      onClick={() => handleSnooze(option.minutes)}
                      className="px-3 py-2 text-xs rounded-md border hover:bg-muted transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowSnoozeOptions(false)}
                  className="w-full mt-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Contextual actions */}
            {contextualActions.length > 0 && (
              <div className="space-y-2">
                {contextualActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`
                      w-full flex items-center justify-center gap-2 h-12 rounded-lg font-medium transition-colors
                      ${action.variant === 'primary' 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'border-2 border-primary text-primary hover:bg-primary/5'
                      }
                    `}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Secondary actions */}
            <div className="flex gap-2">
              {canSnooze && (
                <button
                  onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border hover:bg-muted transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Posponer
                </button>
              )}
              
              <button
                onClick={handleMarkAsImportant}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border transition-colors text-sm ${
                  notification.isImportant 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                    : 'hover:bg-muted'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {notification.isImportant ? 'Quitar' : 'Importante'}
              </button>
              
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border hover:bg-muted transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Marcar leída
                </button>
              )}
            </div>

            {/* Delete action */}
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar notificación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

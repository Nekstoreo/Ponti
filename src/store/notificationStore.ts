import { create } from "zustand";
import { NotificationItem, NotificationSettings } from "@/data/types";

interface NotificationState {
  notifications: NotificationItem[];
  settings: NotificationSettings;
  unreadCount: number;
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotification: (notification: NotificationItem) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markAsImportant: (id: string, isImportant: boolean) => void;
  snoozeNotification: (id: string, snoozeUntil: string) => void;
  deleteNotification: (id: string) => void;
  clearExpiredNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  getUnreadNotifications: () => NotificationItem[];
  getRecentNotifications: (limit?: number) => NotificationItem[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  settings: {
    classReminders: { enabled: true, minutesBefore: 15 },
    announcements: { enabled: true, importantOnly: false },
    scheduleChanges: { enabled: true },
    serviceUpdates: { enabled: true },
    general: { enabled: true },
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
  },
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  addNotification: (notification) => {
    set((state) => {
      const newNotifications = [notification, ...state.notifications];
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      return { notifications: newNotifications, unreadCount };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const newNotifications = state.notifications.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      );
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      return { notifications: newNotifications, unreadCount };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const newNotifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true,
      }));
      return { notifications: newNotifications, unreadCount: 0 };
    });
  },

  markAsImportant: (id, isImportant) => {
    set((state) => {
      const newNotifications = state.notifications.map(notification =>
        notification.id === id
          ? { ...notification, isImportant }
          : notification
      );
      return { notifications: newNotifications };
    });
  },

  snoozeNotification: (id, snoozeUntil) => {
    set((state) => {
      const newNotifications = state.notifications.map(notification =>
        notification.id === id
          ? { 
              ...notification, 
              isRead: true, // Mark as read when snoozed
              expiresAt: snoozeUntil // Use expiresAt to handle snoozing logic
            }
          : notification
      );
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      return { notifications: newNotifications, unreadCount };
    });
  },

  deleteNotification: (id) => {
    set((state) => {
      const newNotifications = state.notifications.filter(notification => notification.id !== id);
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      return { notifications: newNotifications, unreadCount };
    });
  },

  clearExpiredNotifications: () => {
    const now = new Date();
    set((state) => {
      const newNotifications = state.notifications.filter(notification => {
        if (notification.expiresAt) {
          return new Date(notification.expiresAt) > now;
        }
        return true;
      });
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      return { notifications: newNotifications, unreadCount };
    });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  getUnreadNotifications: () => {
    return get().notifications.filter(notification => !notification.isRead);
  },

  getRecentNotifications: (limit = 10) => {
    return get().notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
}));

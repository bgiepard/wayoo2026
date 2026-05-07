import type { Notification } from './domain';

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  addLocalNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

export interface PusherContextType {
  isConnected: boolean;
  hasNewNotification: boolean;
  clearNewNotificationFlag: () => void;
}

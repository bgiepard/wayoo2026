import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export interface Notification {
  id: string;
  type: "new_offer" | "offer_accepted" | "info";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Zaladuj powiadomienia z localStorage przy starcie
  useEffect(() => {
    const saved = localStorage.getItem("wayoo_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(
          parsed.map((n: Notification) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
        );
      } catch {
        // Ignoruj bledy parsowania
      }
    }
  }, []);

  // Zapisz powiadomienia do localStorage przy zmianie
  useEffect(() => {
    localStorage.setItem("wayoo_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        createdAt: new Date(),
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Max 50 powiadomien
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}

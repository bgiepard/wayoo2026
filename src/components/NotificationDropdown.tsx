import { useRef, useEffect, useState } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { usePusher } from "@/context/PusherContext";
import { BellIcon } from "./icons";

function formatTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Teraz";
  if (minutes < 60) return `${minutes} min temu`;
  if (hours < 24) return `${hours} godz temu`;
  return `${days} dni temu`;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { hasNewNotification, clearNewNotificationFlag } = usePusher();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasNewNotification) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        clearNewNotificationFlag();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasNewNotification, clearNewNotificationFlag]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const wasOpen = isOpen;
    setIsOpen(!isOpen);
    if (!wasOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) window.location.href = link;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`relative p-2 text-white hover:text-gray-300 ${isAnimating ? "animate-bell" : ""}`}
      >
        <BellIcon className={isAnimating ? "text-blue-600" : ""} />
        {unreadCount > 0 && (
          <span className={`absolute top-0 right-0 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ${isAnimating ? "animate-pulse" : ""}`}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center p-3 border-b border-gray-100">
            <span className="font-medium text-sm">Powiadomienia</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-gray-500 hover:text-gray-800">
                Oznacz jako przeczytane
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">Brak powiadomien</div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

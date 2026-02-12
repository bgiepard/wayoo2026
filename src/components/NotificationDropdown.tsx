import {useRef, useEffect, useState} from "react";
import {useNotifications} from "@/context/NotificationsContext";
import {usePusher} from "@/context/PusherContext";
import {BellIcon} from "./icons";

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

function NotificationIcon({type}: { type: string }) {
    if (type === "new_offer") {
        return (
            <div className="w-[36px] h-[36px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.09 8.26L21 9.27L16.18 13.97L17.18 21L12 17.77L6.82 21L7.82 13.97L3 9.27L9.91 8.26L12 2Z" stroke="#0B298F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        );
    }
    if (type === "offer_accepted") {
        return (
            <div className="w-[36px] h-[36px] rounded-full bg-[#E6F6EC] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#01A83D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        );
    }
    return (
        <div className="w-[36px] h-[36px] rounded-full bg-[#F0F1F3] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#5B5E68" strokeWidth="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="#5B5E68" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        </div>
    );
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const {notifications, unreadCount, markAsRead, markAllAsRead} = useNotifications();
    const {hasNewNotification, clearNewNotificationFlag} = usePusher();
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
                className={`relative p-2 text-white hover:text-gray-300 transition-colors ${isAnimating ? "animate-bell" : ""}`}
            >
                <BellIcon/>
                {unreadCount > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 bg-[#FFC428] text-[#010101] text-[10px] font-[700] w-[18px] h-[18px] rounded-full flex items-center justify-center ${isAnimating ? "animate-pulse" : ""}`}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-[380px] bg-white rounded-[8px] border border-[#D9DADC] shadow-lg z-50 overflow-hidden">
                    {/* Naglowek */}
                    <div className="flex justify-between items-center px-5 py-4 border-b border-[#D9DADC]">
                        <span className="text-[#0B298F] text-[16px] font-[600]">Powiadomienia</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[13px] text-[#0B298F] font-[500] hover:opacity-80 transition-opacity"
                            >
                                Oznacz wszystkie
                            </button>
                        )}
                    </div>

                    {/* Lista */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <div className="w-[48px] h-[48px] rounded-full bg-[#F0F1F3] flex items-center justify-center mx-auto mb-3">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#9B9DA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#9B9DA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <p className="text-[#5B5E68] text-[14px]">Brak powiadomien</p>
                            </div>
                        ) : (
                            notifications.slice(0, 15).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors border-b border-[#F0F1F3] last:border-b-0 ${
                                        !notification.read
                                            ? "bg-[#FAFBFF] hover:bg-[#F0F2FF]"
                                            : "hover:bg-[#F8F9FA]"
                                    }`}
                                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                                >
                                    <NotificationIcon type={notification.type}/>
                                    <div className="flex-1 min-w-0">
                                        {/* Trasa (title) */}
                                        <p className={`text-[14px] leading-tight truncate ${!notification.read ? "text-[#010101] font-[600]" : "text-[#010101] font-[500]"}`}>
                                            {notification.title}
                                        </p>
                                        {/* Wiadomosc */}
                                        <p className="text-[#5B5E68] text-[13px] mt-1 leading-snug">
                                            {notification.message}
                                        </p>
                                        {/* Czas */}
                                        <p className="text-[#9B9DA3] text-[12px] mt-1.5">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>
                                    {/* Kropka nieprzeczytanego */}
                                    {!notification.read && (
                                        <div className="w-[8px] h-[8px] rounded-full bg-[#FFC428] shrink-0 mt-1.5"/>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

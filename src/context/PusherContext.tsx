import { createContext, useContext, useEffect, useRef, ReactNode, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient, type NewOfferEvent } from "@/lib/pusher-client";
import { useNotifications } from "./NotificationsContext";
import type { Channel } from "pusher-js";

interface PusherContextType {
  isConnected: boolean;
  hasNewNotification: boolean;
  clearNewNotificationFlag: () => void;
}

const PusherContext = createContext<PusherContextType | null>(null);

export function PusherProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { addLocalNotification, refreshNotifications } = useNotifications();
  const channelsRef = useRef<Map<string, Channel>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Przechowuj funkcje w refach aby uniknac problemow z zaleznosciami
  const addLocalNotificationRef = useRef(addLocalNotification);
  const refreshNotificationsRef = useRef(refreshNotifications);

  // Aktualizuj refy gdy funkcje sie zmienia
  useEffect(() => {
    addLocalNotificationRef.current = addLocalNotification;
    refreshNotificationsRef.current = refreshNotifications;
  }, [addLocalNotification, refreshNotifications]);

  const clearNewNotificationFlag = useCallback(() => {
    setHasNewNotification(false);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      // Wyczysc subskrypcje gdy uzytkownik sie wyloguje
      const pusher = getPusherClient();
      channelsRef.current.forEach((_, requestId) => {
        pusher.unsubscribe(`request-${requestId}`);
      });
      channelsRef.current.clear();
      setIsConnected(false);
      return;
    }

    // Pobierz aktywne zlecenia uzytkownika
    const fetchAndSubscribe = async () => {
      try {
        const res = await fetch("/api/my-requests?status=published");
        if (!res.ok) return;

        const requests: { id: string }[] = await res.json();
        const pusher = getPusherClient();

        // Subskrybuj do kazdego aktywnego zlecenia
        requests.forEach((request) => {
          if (channelsRef.current.has(request.id)) return; // Juz subskrybowany

          const channel = pusher.subscribe(`request-${request.id}`);

          channel.bind("new-offer", (data: NewOfferEvent) => {
            console.log("[Pusher] Otrzymano event new-offer:", data);

            // Dodaj lokalnie (bez zapisu do bazy - juz zapisane przez nadawce)
            addLocalNotificationRef.current({
              type: "new_offer",
              title: "Nowa oferta!",
              message: `${data.driverName || "Kierowca"} zlozyl oferte: ${data.price} PLN`,
              link: `/request/${data.requestId}/offers`,
            });
            setHasNewNotification(true);

            // Odswierz powiadomienia z bazy (zsynchronizuje prawdziwe ID)
            setTimeout(() => refreshNotificationsRef.current(), 500);
          });

          channelsRef.current.set(request.id, channel);
        });

        // Usun subskrypcje dla zlecen ktore juz nie sa aktywne
        const activeIds = new Set(requests.map(r => r.id));
        channelsRef.current.forEach((_, requestId) => {
          if (!activeIds.has(requestId)) {
            pusher.unsubscribe(`request-${requestId}`);
            channelsRef.current.delete(requestId);
          }
        });

        setIsConnected(true);
      } catch (error) {
        console.error("[PusherContext] Error fetching requests:", error);
      }
    };

    fetchAndSubscribe();

    // Odswiezaj subskrypcje co 30 sekund (na wypadek nowych zlecen)
    const interval = setInterval(fetchAndSubscribe, 30000);

    return () => {
      clearInterval(interval);
      // Wyczysc wszystkie subskrypcje przy cleanup
      const pusher = getPusherClient();
      channelsRef.current.forEach((_, requestId) => {
        pusher.unsubscribe(`request-${requestId}`);
      });
      channelsRef.current.clear();
    };
  }, [session]); // Tylko session w deps - funkcje sa w refach

  return (
    <PusherContext.Provider value={{ isConnected, hasNewNotification, clearNewNotificationFlag }}>
      {children}
    </PusherContext.Provider>
  );
}

export function usePusher() {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error("usePusher must be used within PusherProvider");
  }
  return context;
}

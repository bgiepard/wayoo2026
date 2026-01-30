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
  const { addNotification } = useNotifications();
  const channelsRef = useRef<Map<string, Channel>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const clearNewNotificationFlag = useCallback(() => {
    setHasNewNotification(false);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      // Wyczyść subskrypcje gdy użytkownik się wyloguje
      const pusher = getPusherClient();
      channelsRef.current.forEach((_, requestId) => {
        pusher.unsubscribe(`request-${requestId}`);
      });
      channelsRef.current.clear();
      setIsConnected(false);
      return;
    }

    // Pobierz aktywne zlecenia użytkownika
    const fetchAndSubscribe = async () => {
      try {
        const res = await fetch("/api/my-requests?status=published");
        if (!res.ok) return;

        const requests: { id: string }[] = await res.json();
        const pusher = getPusherClient();

        // Subskrybuj do każdego aktywnego zlecenia
        requests.forEach((request) => {
          if (channelsRef.current.has(request.id)) return; // Już subskrybowany

          const channel = pusher.subscribe(`request-${request.id}`);

          channel.bind("new-offer", (data: NewOfferEvent) => {
            addNotification({
              type: "new_offer",
              title: "Nowa oferta!",
              message: `${data.driverName || "Kierowca"} zlozyl oferte: ${data.price} PLN`,
              link: `/request/${data.requestId}/offers`,
            });
            setHasNewNotification(true);
          });

          channelsRef.current.set(request.id, channel);
        });

        // Usuń subskrypcje dla zleceń które już nie są aktywne
        const activeIds = new Set(requests.map(r => r.id));
        channelsRef.current.forEach((channel, requestId) => {
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

    // Odświeżaj subskrypcje co 30 sekund (na wypadek nowych zleceń)
    const interval = setInterval(fetchAndSubscribe, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [session, addNotification]);

  // Cleanup przy unmount
  useEffect(() => {
    return () => {
      const pusher = getPusherClient();
      channelsRef.current.forEach((_, requestId) => {
        pusher.unsubscribe(`request-${requestId}`);
      });
      channelsRef.current.clear();
    };
  }, []);

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

import { createContext, useContext, useEffect, useRef, ReactNode, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient, type NewOfferEvent } from "@/lib/pusher-client";
import { useNotifications } from "./NotificationsContext";

interface PusherContextType {
  isConnected: boolean;
  hasNewNotification: boolean;
  clearNewNotificationFlag: () => void;
}

const PusherContext = createContext<PusherContextType | null>(null);

export function PusherProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { addLocalNotification, refreshNotifications } = useNotifications();
  const subscribedChannelsRef = useRef<Set<string>>(new Set());
  const boundEventsRef = useRef<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const addLocalNotificationRef = useRef(addLocalNotification);
  const refreshNotificationsRef = useRef(refreshNotifications);

  useEffect(() => {
    addLocalNotificationRef.current = addLocalNotification;
    refreshNotificationsRef.current = refreshNotifications;
  }, [addLocalNotification, refreshNotifications]);

  const clearNewNotificationFlag = useCallback(() => {
    setHasNewNotification(false);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      if (subscribedChannelsRef.current.size > 0) {
        const pusher = getPusherClient();
        if (pusher) {
          subscribedChannelsRef.current.forEach((channelName) => {
            pusher.unsubscribe(channelName);
          });
        }
        subscribedChannelsRef.current.clear();
        boundEventsRef.current.clear();
        setIsConnected(false);
      }
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) return;

    const subscribeToRequests = async () => {
      try {
        const res = await fetch("/api/my-requests?status=published");
        if (!res.ok) return;

        const requests: { id: string }[] = await res.json();

        requests.forEach((request) => {
          const channelName = `request-${request.id}`;

          // Sprawdz czy juz mamy handler dla tego kanalu
          if (boundEventsRef.current.has(channelName)) return;

          const channel = pusher.subscribe(channelName);
          subscribedChannelsRef.current.add(channelName);

          // Bind tylko jesli jeszcze nie zrobione
          channel.unbind("new-offer"); // Usun stary handler jesli istnieje
          channel.bind("new-offer", (data: NewOfferEvent) => {
            addLocalNotificationRef.current({
              type: "new_offer",
              title: "Nowa oferta!",
              message: `${data.driverName || "Kierowca"} zlozyl oferte: ${data.price} PLN`,
              link: `/request/${data.requestId}/offers`,
            });
            setHasNewNotification(true);
            setTimeout(() => refreshNotificationsRef.current(), 500);
          });

          boundEventsRef.current.add(channelName);

          channel.bind("pusher:subscription_succeeded", () => {
            setIsConnected(true);
          });
        });

        // Odsubskrybuj nieaktywne kanaly
        const activeChannels = new Set(requests.map((r) => `request-${r.id}`));
        subscribedChannelsRef.current.forEach((channelName) => {
          if (!activeChannels.has(channelName)) {
            pusher.unsubscribe(channelName);
            subscribedChannelsRef.current.delete(channelName);
            boundEventsRef.current.delete(channelName);
          }
        });
      } catch {
        // Ignore errors
      }
    };

    subscribeToRequests();
    const interval = setInterval(subscribeToRequests, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [status, session]);

  useEffect(() => {
    return () => {
      const pusher = getPusherClient();
      if (pusher && subscribedChannelsRef.current.size > 0) {
        subscribedChannelsRef.current.forEach((channelName) => {
          pusher.unsubscribe(channelName);
        });
        subscribedChannelsRef.current.clear();
        boundEventsRef.current.clear();
      }
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

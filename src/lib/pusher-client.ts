import PusherClient from "pusher-js";

// Singleton Pusher client instance
let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherClient;
}

// Typy eventów
export interface NewOfferEvent {
  offerId: string;
  requestId: string;
  driverId: string;
  driverName?: string;
  price: number;
  message: string;
}

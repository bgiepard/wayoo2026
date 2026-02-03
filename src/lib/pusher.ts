import Pusher from "pusher";

// Pusher server instance (do wysylania eventow)
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Typy eventow
export interface OfferAcceptedEvent {
  offerId: string;
  requestId: string;
  message: string;
}

export interface OfferPaidEvent {
  offerId: string;
  requestId: string;
  message: string;
}

// Funkcje pomocnicze do wysylania eventow do kierowcy
export async function notifyDriverOfferAccepted(driverId: string, data: OfferAcceptedEvent) {
  await pusher.trigger(`driver-${driverId}`, "offer-accepted", data);
}

export async function notifyDriverOfferPaid(driverId: string, data: OfferPaidEvent) {
  await pusher.trigger(`driver-${driverId}`, "offer-paid", data);
}

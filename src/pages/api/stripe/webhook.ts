import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { updateRequestStatus, markOfferAsPaid } from "@/services";
import { offersTable, notificationsTable } from "@/lib/airtable";
import { notifyDriverOfferPaid } from "@/lib/pusher";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// Wyłącz domyślny body parser Next.js — Stripe wymaga raw body do weryfikacji podpisu
export const config = {
  api: {
    bodyParser: false,
  },
};

// Pomocnicza funkcja do odczytania raw body z requesta
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"] as string;
  if (!signature) {
    return res.status(400).json({ error: "Brak podpisu Stripe" });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Stripe webhook] Błąd weryfikacji podpisu:", msg);
    return res.status(400).json({ error: `Błąd weryfikacji: ${msg}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { requestId, offerId } = session.metadata || {};

    if (!requestId || !offerId) {
      console.error("[Stripe webhook] Brak requestId lub offerId w metadata");
      return res.status(400).json({ error: "Brak metadata" });
    }

    try {
      // Zmień statusy w Airtable (ta sama logika co w /api/requests/[id]/status)
      await updateRequestStatus(requestId, "paid");
      await markOfferAsPaid(requestId, offerId);

      // Zapisz paymentIntentId w ofercie
      if (session.payment_intent) {
        await offersTable.update(offerId, {
          stripePaymentIntentId: session.payment_intent as string,
        });
      }

      // Wyślij powiadomienie do kierowcy
      try {
        const allOffers = await offersTable.select().all();
        const paidOffer = allOffers.find((r) => r.id === offerId);

        if (paidOffer) {
          const driverLinks = paidOffer.get("Driver") as string[] | undefined;
          const driverId = driverLinks?.[0];

          if (driverId) {
            const notificationMessage =
              "Klient opłacił przejazd. Możesz przystąpić do realizacji zlecenia.";

            await notificationsTable.create({
              userId: driverId,
              type: "info",
              title: "Przejazd opłacony!",
              message: notificationMessage,
              link: "/my-offers",
              read: false,
              createdAt: new Date().toISOString(),
            });

            await notifyDriverOfferPaid(driverId, {
              offerId,
              requestId,
              message: notificationMessage,
            });
          }
        }
      } catch (notifError) {
        console.error("[Stripe webhook] Błąd powiadomienia kierowcy:", notifError);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[Stripe webhook] Błąd aktualizacji statusu:", msg);
      return res.status(500).json({ error: "Błąd wewnętrzny" });
    }
  }

  return res.status(200).json({ received: true });
}

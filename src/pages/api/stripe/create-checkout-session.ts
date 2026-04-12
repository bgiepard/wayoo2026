import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Stripe from "stripe";
import { getRequestById, getOffersByRequest } from "@/services";
import { requestsTable } from "@/lib/airtable";
import type { Route } from "@/models";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

interface SessionUser {
  id?: string;
  email?: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Brak autoryzacji" });
  }

  const user = session.user as SessionUser;
  const { requestId, offerId } = req.body;

  if (!requestId || !offerId) {
    return res.status(400).json({ error: "Brak requestId lub offerId" });
  }

  // Pobierz zlecenie i zweryfikuj właściciela
  const request = await getRequestById(requestId);
  if (!request) {
    return res.status(404).json({ error: "Zlecenie nie istnieje" });
  }

  const userId = user.id || "";
  const userEmail = user.email || "";
  const hasAccess = request.userId === userId || request.userEmail === userEmail;
  if (!hasAccess) {
    return res.status(403).json({ error: "Brak dostępu" });
  }

  // Pobierz ofertę i zweryfikuj, że należy do tego zlecenia
  const offers = await getOffersByRequest(requestId);
  const offer = offers.find((o) => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ error: "Oferta nie istnieje" });
  }

  // Zbuduj opis trasy
  const route: Route = JSON.parse(request.route || "{}");
  const origin = route.origin?.address?.split(",")[0] || "Miejsce startowe";
  const destination = route.destination?.address?.split(",")[0] || "Cel podróży";
  const trasaOpis = `${origin} → ${destination}, ${request.date} ${request.time}`;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pln",
            unit_amount: Math.round(offer.price * 100), // Stripe wymaga groszy
            product_data: {
              name: `Przejazd Wayoo`,
              description: trasaOpis,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        requestId,
        offerId,
      },
      success_url: `${baseUrl}/request/${requestId}/payment?session_id={CHECKOUT_SESSION_ID}&offerId=${offerId}`,
      cancel_url: `${baseUrl}/request/${requestId}/payment?offerId=${offerId}&canceled=1`,
    });

    // Zapisz stripeSessionId w Airtable (tabela Requests)
    await requestsTable.update(requestId, {
      stripeSessionId: checkoutSession.id,
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("[Stripe] Błąd tworzenia sesji:", {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      statusCode: error?.statusCode,
      raw: String(error),
    });
    return res.status(500).json({ error: "Nie udało się zainicjować płatności" });
  }
}

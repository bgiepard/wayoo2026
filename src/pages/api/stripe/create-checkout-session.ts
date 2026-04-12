import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { getRequestById, getOffersByRequest } from "@/services";
import { requestsTable } from "@/lib/airtable";
import type { Route } from "@/models";

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

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("[Stripe] Brak STRIPE_SECRET_KEY w zmiennych środowiskowych");
    return res.status(500).json({ error: "Brak konfiguracji płatności" });
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

  // Pobierz ofertę
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
  const unitAmount = Math.round(offer.price * 100);

  // Buduj URL-encoded body dla Stripe REST API (bez SDK)
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("payment_method_types[0]", "card");
  params.append("line_items[0][price_data][currency]", "pln");
  params.append("line_items[0][price_data][unit_amount]", String(unitAmount));
  params.append("line_items[0][price_data][product_data][name]", "Przejazd Wayoo");
  params.append("line_items[0][price_data][product_data][description]", trasaOpis);
  params.append("line_items[0][quantity]", "1");
  params.append("metadata[requestId]", requestId);
  params.append("metadata[offerId]", offerId);
  params.append("success_url", `${baseUrl}/request/${requestId}/payment?session_id={CHECKOUT_SESSION_ID}&offerId=${offerId}`);
  params.append("cancel_url", `${baseUrl}/request/${requestId}/payment?offerId=${offerId}&canceled=1`);

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await stripeRes.json() as any;

    if (!stripeRes.ok) {
      console.error("[Stripe] Błąd API:", data?.error);
      return res.status(500).json({ error: "Nie udało się zainicjować płatności" });
    }

    // Zapisz stripeSessionId w Airtable
    await requestsTable.update(requestId, {
      stripeSessionId: data.id,
    });

    return res.status(200).json({ url: data.url });
  } catch (error: any) {
    console.error("[Stripe] Błąd fetch:", {
      message: error?.message,
      cause: error?.cause,
      raw: String(error),
    });
    return res.status(500).json({ error: "Nie udało się zainicjować płatności" });
  }
}

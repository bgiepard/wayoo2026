import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { getRequestById, acceptOffer, updateRequestStatus, getDriverById } from "@/services";
import { notificationsTable } from "@/lib/airtable";
import { notifyDriverOfferAccepted } from "@/lib/pusher";
import { offersTable } from "@/lib/airtable";

interface SessionUser {
  id?: string;
  email?: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = session.user as SessionUser;
  const { id } = req.query;
  const { offerId } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Brak ID zlecenia" });
  }
  if (!offerId || typeof offerId !== "string") {
    return res.status(400).json({ error: "Brak ID oferty" });
  }

  const request = await getRequestById(id);
  if (!request) {
    return res.status(404).json({ error: "Zlecenie nie istnieje" });
  }

  const userId = user.id || "";
  const userEmail = user.email || "";
  const hasAccess = request.userId === userId || request.userEmail === userEmail;
  if (!hasAccess) {
    return res.status(403).json({ error: "Brak dostępu" });
  }

  if (request.status !== "published") {
    return res.status(409).json({ error: "Zlecenie nie jest już aktywne" });
  }

  try {
    // Pobierz ofertę aby znaleźć driverId
    const offerRecord = await offersTable.find(offerId);
    const driverLinks = offerRecord.get("Driver") as string[] | undefined;
    const driverId = driverLinks?.[0];

    if (!driverId) {
      return res.status(400).json({ error: "Oferta nie ma przypisanego kierowcy" });
    }

    // Zaakceptuj ofertę i zaktualizuj status zlecenia
    await acceptOffer(id, offerId);
    await updateRequestStatus(id, "accepted");

    // Pobierz dane kontaktowe kierowcy
    const driver = await getDriverById(driverId);

    // Wyślij powiadomienie do kierowcy
    try {
      const notificationMessage = "Pasażer wybrał Twoją ofertę. Skontaktuj się z nim w celu potwierdzenia szczegółów.";

      await notificationsTable.create({
        userId: driverId,
        type: "info",
        title: "Twoja oferta została wybrana!",
        message: notificationMessage,
        link: "/my-offers",
        read: false,
        createdAt: new Date().toISOString(),
      });

      await notifyDriverOfferAccepted(driverId, {
        offerId,
        requestId: id,
        message: notificationMessage,
      });
    } catch (notifError) {
      console.error("[accept-offer] Błąd powiadomienia:", notifError);
    }

    return res.status(200).json({
      success: true,
      driver: {
        name: driver?.name || null,
        phone: driver?.phone || null,
        email: driver?.email || null,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[accept-offer] Błąd:", msg);
    return res.status(500).json({ error: "Nie udało się zaakceptować oferty", detail: msg });
  }
}

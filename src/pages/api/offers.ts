import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { getOffersByRequest, acceptOffer, getRequestById } from "@/services";
import { offersTable, notificationsTable } from "@/lib/airtable";
import { notifyDriverOfferAccepted } from "@/lib/pusher";

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = session.user as SessionUser;
  const userId = user.id || "";

  if (req.method === "GET") {
    const { requestId } = req.query;

    if (!requestId || typeof requestId !== "string") {
      return res.status(400).json({ error: "Request ID is required" });
    }

    try {
      const request = await getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const userEmail = user.email || "";
      const hasAccess = request.userId === userId || request.userEmail === userEmail;
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      const offers = await getOffersByRequest(requestId);
      return res.status(200).json(offers);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch offers" });
    }
  }

  if (req.method === "POST") {
    const { action, offerId, requestId } = req.body;

    if (action === "accept") {
      if (!offerId || !requestId) {
        return res.status(400).json({ error: "Offer ID and Request ID are required" });
      }

      try {
        // Verify that the request belongs to this user
        const request = await getRequestById(requestId);
        if (!request) {
          return res.status(404).json({ error: "Request not found" });
        }

        const userEmail = user.email || "";
        const hasAccess = request.userId === userId || request.userEmail === userEmail;
        if (!hasAccess) {
          return res.status(403).json({ error: "Access denied" });
        }

        await acceptOffer(offerId, requestId);

        // Wyslij powiadomienie do kierowcy (baza + Pusher)
        try {
          const offerRecord = await offersTable.find(offerId);
          const driverLinks = offerRecord.get("Driver") as string[] | undefined;
          const driverId = driverLinks?.[0];

          if (driverId) {
            const notificationMessage = "Twoja oferta na zlecenie zostala zaakceptowana.";

            // 1. Zapisz do bazy danych
            await notificationsTable.create({
              userId: driverId,
              type: "offer_accepted",
              title: "Oferta zaakceptowana!",
              message: notificationMessage,
              link: "/my-offers",
              read: false,
              createdAt: new Date().toISOString(),
            });

            // 2. Wyslij przez Pusher (real-time)
            await notifyDriverOfferAccepted(driverId, {
              offerId,
              requestId,
              message: notificationMessage,
            });
          }
        } catch (notifError) {
          console.error("[API/offers] Error sending notification to driver:", notifError);
        }

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Error accepting offer:", error);
        return res.status(500).json({ error: "Failed to accept offer" });
      }
    }

    return res.status(400).json({ error: "Invalid action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

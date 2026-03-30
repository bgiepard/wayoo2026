import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { updateRequestStatus, markOfferAsPaid, getRequestById } from "@/services";
import type { RequestStatus } from "@/models";
import { offersTable, notificationsTable } from "@/lib/airtable";
import { notifyDriverOfferPaid } from "@/lib/pusher";

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
  const { status, offerId } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing request ID" });
  }

  const validStatuses: RequestStatus[] = ["draft", "published", "paid", "completed", "canceled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const request = await getRequestById(id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  const userId = user.id || "";
  const userEmail = user.email || "";
  const hasAccess = request.userId === userId || request.userEmail === userEmail;
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await updateRequestStatus(id, status);

    // Jeśli status zmienia się na "paid", zaktualizuj też status oferty i wyślij powiadomienie
    if (status === "paid") {
      await markOfferAsPaid(id, offerId);

      // Wyślij powiadomienie do kierowcy o opłaceniu
      try {
        const allOffers = await offersTable.select().all();
        const acceptedOffer = offerId
          ? allOffers.find((record) => record.id === offerId)
          : allOffers.find((record) => {
              const requestLinks = record.get("Request") as string[] | undefined;
              const requestIdField = record.get("requestId") as string | undefined;
              const belongsToRequest = requestLinks?.includes(id) || requestIdField === id;
              const offerStatus = record.get("status") as string;
              return belongsToRequest && offerStatus === "paid";
            });

        if (acceptedOffer) {
          const driverLinks = acceptedOffer.get("Driver") as string[] | undefined;
          const driverId = driverLinks?.[0];

          if (driverId) {
            const notificationMessage = "Klient oplacil przejazd. Mozesz przystapic do realizacji zlecenia.";

            // 1. Zapisz do bazy danych
            await notificationsTable.create({
              userId: driverId,
              type: "info",
              title: "Przejazd oplacony!",
              message: notificationMessage,
              link: "/my-offers",
              read: false,
              createdAt: new Date().toISOString(),
            });

            // 2. Wyslij przez Pusher (real-time)
            await notifyDriverOfferPaid(driverId, {
              offerId: acceptedOffer.id,
              requestId: id,
              message: notificationMessage,
            });
          }
        }
      } catch (notifError) {
        console.error("[API/status] Error sending payment notification to driver:", notifError);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error updating request status:", msg);
    return res.status(500).json({ error: "Failed to update status", detail: msg });
  }
}

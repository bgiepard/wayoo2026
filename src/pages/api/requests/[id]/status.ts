import type { NextApiRequest, NextApiResponse } from "next";
import { updateRequestStatus, markOfferAsPaid } from "@/services";
import type { RequestStatus } from "@/models";
import { offersTable, notificationsTable } from "@/lib/airtable";
import { notifyDriverOfferPaid } from "@/lib/pusher";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const { status } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing request ID" });
  }

  const validStatuses: RequestStatus[] = ["draft", "published", "accepted", "paid", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await updateRequestStatus(id, status);

    // Jeśli status zmienia się na "paid", zaktualizuj też status oferty i wyślij powiadomienie
    if (status === "paid") {
      await markOfferAsPaid(id);

      // Wyślij powiadomienie do kierowcy o opłaceniu
      try {
        const allOffers = await offersTable.select().all();
        const acceptedOffer = allOffers.find((record) => {
          const requestLinks = record.get("Request") as string[] | undefined;
          const requestIdField = record.get("requestId") as string | undefined;
          const belongsToRequest = requestLinks?.includes(id) || requestIdField === id;
          const offerStatus = record.get("status") as string;
          return belongsToRequest && (offerStatus === "accepted" || offerStatus === "paid");
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
  } catch (error) {
    console.error("Error updating request status:", error);
    return res.status(500).json({ error: "Failed to update status" });
  }
}

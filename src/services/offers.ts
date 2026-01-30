import { offersTable, requestsTable } from "@/lib/airtable";
import { getDriverById } from "./drivers";
import type { OfferData, OfferStatus } from "@/models";

export async function getOffersByRequest(requestId: string): Promise<OfferData[]> {
  const allRecords = await offersTable.select().all();

  const records = allRecords.filter((record) => {
    const requestLinks = record.get("Request") as string[] | undefined;
    const requestIdField = record.get("requestId") as string | undefined;
    return requestLinks?.includes(requestId) || requestIdField === requestId;
  });

  const offers = await Promise.all(
    records.map(async (record) => {
      const requestLinks = record.get("Request") as string[] | undefined;
      const driverLinks = record.get("Driver") as string[] | undefined;
      const driverId = driverLinks?.[0] || "";

      let driverName, driverEmail, driverPhone;
      if (driverId) {
        const driver = await getDriverById(driverId);
        if (driver) {
          driverName = driver.name;
          driverEmail = driver.email;
          driverPhone = driver.phone;
        }
      }

      return {
        id: record.id,
        requestId: requestLinks?.[0] || "",
        driverId,
        driverName,
        driverEmail,
        driverPhone,
        price: record.get("price") as number,
        message: record.get("message") as string,
        status: (record.get("status") as OfferStatus) || "new",
      } as OfferData;
    })
  );

  // Sortuj od najnowszych
  return offers.reverse();
}

export async function getOffersCountByRequestIds(
  requestIds: string[]
): Promise<Record<string, number>> {
  if (requestIds.length === 0) return {};

  const allRecords = await offersTable.select().all();

  const counts: Record<string, number> = {};
  requestIds.forEach((id) => (counts[id] = 0));

  allRecords.forEach((record) => {
    const requestLinks = record.get("Request") as string[] | undefined;
    const requestId = requestLinks?.[0];
    if (requestId && requestIds.includes(requestId)) {
      counts[requestId] = (counts[requestId] || 0) + 1;
    }
  });

  return counts;
}

export async function acceptOffer(offerId: string, requestId: string): Promise<void> {
  // Zaakceptuj ofertę
  await offersTable.update(offerId, { status: "accepted" });

  // Zmień status zapytania
  await requestsTable.update(requestId, { status: "accepted" });

  // Odrzuć pozostałe oferty na to samo zlecenie
  const allOffers = await offersTable.select().all();

  for (const record of allOffers) {
    if (record.id === offerId) continue;

    const requestLinks = record.get("Request") as string[] | undefined;
    const requestIdField = record.get("requestId") as string | undefined;
    const belongsToRequest = requestLinks?.includes(requestId) || requestIdField === requestId;

    if (belongsToRequest) {
      await offersTable.update(record.id, { status: "rejected" });
    }
  }
}

export async function markOfferAsPaid(requestId: string): Promise<void> {
  // Znajdź zaakceptowaną ofertę dla tego zlecenia i zmień jej status na "paid"
  const allOffers = await offersTable.select().all();

  for (const record of allOffers) {
    const requestLinks = record.get("Request") as string[] | undefined;
    const requestIdField = record.get("requestId") as string | undefined;
    const belongsToRequest = requestLinks?.includes(requestId) || requestIdField === requestId;
    const status = record.get("status") as OfferStatus;

    if (belongsToRequest && status === "accepted") {
      await offersTable.update(record.id, { status: "paid" });
      break;
    }
  }
}

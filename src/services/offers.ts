import { offersTable, requestsTable } from "@/lib/airtable";
import { getDriverById } from "./drivers";
import type { OfferData } from "@/models";

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
        status: (record.get("status") as number) || 1,
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
  await offersTable.update(offerId, { status: 2 });

  // Zmień status zapytania
  await requestsTable.update(requestId, { status: "accepted" });

  // Odrzuć pozostałe oferty
  const otherOffers = await offersTable
    .select({
      filterByFormula: `AND(FIND("${requestId}", ARRAYJOIN({Request})), NOT(RECORD_ID() = "${offerId}"))`,
    })
    .all();

  for (const offer of otherOffers) {
    await offersTable.update(offer.id, { status: 3 });
  }
}

import type { FieldSet, Record as AirtableRecord } from "airtable";
import { requestsTable } from "@/lib/airtable";
import type { RequestData, RequestStatus, CreateRequestData } from "@/models";

// Mapowanie rekordu Airtable na obiekt RequestData
function mapRecordToRequest(record: AirtableRecord<FieldSet>): RequestData {
  const userLinks = record.get("User") as string[] | undefined;

  return {
    id: record.id,
    userId: userLinks?.[0] || (record.get("userId") as string),
    userEmail: record.get("userEmail") as string,
    route: (record.get("route") as string) || "{}",
    date: record.get("date") as string,
    time: record.get("time") as string,
    adults: record.get("adults") as number,
    children: record.get("children") as number,
    options: record.get("options") as string,
    status: (record.get("status") as RequestStatus) || "published",
  };
}

export async function createRequest(
  userId: string,
  userEmail: string,
  data: CreateRequestData
): Promise<RequestData> {
  const record = await requestsTable.create({
    User: [userId],
    userId,
    userEmail,
    route: JSON.stringify(data.route),
    date: data.date,
    time: data.time,
    adults: data.adults,
    children: data.children,
    options: JSON.stringify(data.options),
    status: "published",
  });

  return mapRecordToRequest(record);
}

export async function getRequestById(id: string): Promise<RequestData | null> {
  try {
    const record = await requestsTable.find(id);
    return mapRecordToRequest(record);
  } catch {
    return null;
  }
}

export async function getRequestsByUserId(userId: string): Promise<RequestData[]> {
  const records = await requestsTable
    .select({
      filterByFormula: `FIND("${userId}", ARRAYJOIN({User}))`,
    })
    .all();

  return records.map(mapRecordToRequest);
}

export async function getRequestsByUserEmail(email: string): Promise<RequestData[]> {
  const records = await requestsTable
    .select({
      filterByFormula: `{userEmail} = '${email}'`,
    })
    .all();

  return records.map(mapRecordToRequest);
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<void> {
  await requestsTable.update(requestId, { status });
}

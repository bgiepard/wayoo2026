import { driversTable } from "@/lib/airtable";
import type { Driver } from "@/models";

export async function getDriverById(driverId: string): Promise<Driver | null> {
  try {
    const record = await driversTable.find(driverId);
    return {
      id: record.id,
      email: record.get("email") as string,
      name: record.get("name") as string,
      phone: record.get("phone") as string | undefined,
    };
  } catch {
    return null;
  }
}

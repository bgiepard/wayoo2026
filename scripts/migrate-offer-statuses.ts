import Airtable from "airtable";
import * as dotenv from "dotenv";

// Załaduj zmienne środowiskowe z .env.local
dotenv.config({ path: ".env.local" });

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

const offersTable = base("Offers");

// Mapowanie starych statusów numerycznych na nowe stringowe
const statusMap: Record<number, string> = {
  1: "new",
  2: "accepted",
  3: "rejected",
};

async function migrateOfferStatuses() {
  console.log("Rozpoczynam migrację statusów ofert...\n");

  try {
    const records = await offersTable.select().all();
    console.log(`Znaleziono ${records.length} ofert do sprawdzenia.\n`);

    let updated = 0;
    let skipped = 0;

    for (const record of records) {
      const currentStatus = record.get("status");

      // Sprawdź czy status jest numeryczny i wymaga migracji
      if (typeof currentStatus === "number" && statusMap[currentStatus]) {
        const newStatus = statusMap[currentStatus];
        console.log(
          `Oferta ${record.id}: ${currentStatus} → ${newStatus}`
        );

        await offersTable.update(record.id, { status: newStatus });
        updated++;
      } else if (typeof currentStatus === "string") {
        console.log(
          `Oferta ${record.id}: już ma status stringowy (${currentStatus}) - pomijam`
        );
        skipped++;
      } else {
        console.log(
          `Oferta ${record.id}: nieznany status (${currentStatus}) - ustawiam na "new"`
        );
        await offersTable.update(record.id, { status: "new" });
        updated++;
      }
    }

    console.log(`\nMigracja zakończona!`);
    console.log(`Zaktualizowano: ${updated} ofert`);
    console.log(`Pominięto: ${skipped} ofert`);
  } catch (error) {
    console.error("Błąd podczas migracji:", error);
    process.exit(1);
  }
}

migrateOfferStatuses();

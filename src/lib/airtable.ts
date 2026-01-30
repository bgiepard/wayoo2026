import Airtable from "airtable";

// Konfiguracja połączenia z Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

// Eksport tabel
export const usersTable = base(process.env.AIRTABLE_TABLE_NAME || "Users");
export const requestsTable = base("Requests");
export const offersTable = base("Offers");
export const driversTable = base("Drivers");
export const notificationsTable = base("Notifications");

// Re-eksport typów z models dla wstecznej kompatybilności
export type {
  User,
  CreateUserData,
  AuthProvider,
  Driver,
  RequestData,
  RequestStatus,
  OfferData,
} from "@/models";

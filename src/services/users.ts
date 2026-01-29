import type { FieldSet, Record as AirtableRecord } from "airtable";
import bcrypt from "bcryptjs";
import { usersTable } from "@/lib/airtable";
import type { User, CreateUserData, AuthProvider } from "@/models";

// Mapowanie rekordu Airtable na obiekt User
function mapRecordToUser(record: AirtableRecord<FieldSet>): User {
  return {
    id: record.id,
    email: record.get("email") as string,
    emailVerified: (record.get("emailVerified") as boolean) || false,
    firstName: (record.get("firstName") as string) || "",
    lastName: (record.get("lastName") as string) || "",
    phone: record.get("phone") as string | undefined,
    phoneVerified: (record.get("phoneVerified") as boolean) || false,
    provider: (record.get("provider") as AuthProvider) || "email",
    password: record.get("password") as string | undefined,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const records = await usersTable
    .select({
      filterByFormula: `{email} = '${email}'`,
      maxRecords: 1,
    })
    .firstPage();

  if (records.length === 0) return null;
  return mapRecordToUser(records[0]);
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const record = await usersTable.find(id);
    return mapRecordToUser(record);
  } catch {
    return null;
  }
}

export async function createUser(data: CreateUserData): Promise<User> {
  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, 10)
    : undefined;

  const record = await usersTable.create({
    email: data.email,
    emailVerified: false,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone || "",
    phoneVerified: false,
    provider: data.provider || "email",
    ...(hashedPassword && { password: hashedPassword }),
  });

  return mapRecordToUser(record);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

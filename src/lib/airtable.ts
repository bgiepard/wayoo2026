import Airtable from "airtable";
import bcrypt from "bcryptjs";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

const usersTable = base(process.env.AIRTABLE_TABLE_NAME || "Users");
const requestsTable = base("Requests");

// For backward compatibility
const table = usersTable;

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const records = await table
    .select({
      filterByFormula: `{email} = '${email}'`,
      maxRecords: 1,
    })
    .firstPage();

  if (records.length === 0) return null;

  const record = records[0];
  return {
    id: record.id,
    email: record.get("email") as string,
    name: record.get("name") as string,
    password: record.get("password") as string,
  };
}

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);

  const record = await table.create({
    email,
    password: hashedPassword,
    name,
  });

  return {
    id: record.id,
    email: record.get("email") as string,
    name: record.get("name") as string,
    password: record.get("password") as string,
  };
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Request types and functions
export interface RequestData {
  id: string;
  userId: string;
  userEmail: string;
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  options: string;
}

export async function createRequest(
  userId: string,
  userEmail: string,
  data: {
    from: string;
    to: string;
    date: string;
    time: string;
    adults: number;
    children: number;
    options: Record<string, boolean>;
  }
): Promise<RequestData> {
  const record = await requestsTable.create({
    userId,
    userEmail,
    from: data.from,
    to: data.to,
    date: data.date,
    time: data.time,
    adults: data.adults,
    children: data.children,
    options: JSON.stringify(data.options),
  });

  return {
    id: record.id,
    userId: record.get("userId") as string,
    userEmail: record.get("userEmail") as string,
    from: record.get("from") as string,
    to: record.get("to") as string,
    date: record.get("date") as string,
    time: record.get("time") as string,
    adults: record.get("adults") as number,
    children: record.get("children") as number,
    options: record.get("options") as string,
  };
}

export async function getRequestById(id: string): Promise<RequestData | null> {
  try {
    const record = await requestsTable.find(id);
    return {
      id: record.id,
      userId: record.get("userId") as string,
      userEmail: record.get("userEmail") as string,
      from: record.get("from") as string,
      to: record.get("to") as string,
      date: record.get("date") as string,
      time: record.get("time") as string,
      adults: record.get("adults") as number,
      children: record.get("children") as number,
      options: record.get("options") as string,
    };
  } catch {
    return null;
  }
}

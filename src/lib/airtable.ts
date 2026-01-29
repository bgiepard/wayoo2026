import Airtable from "airtable";
import bcrypt from "bcryptjs";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

const usersTable = base(process.env.AIRTABLE_TABLE_NAME || "Users");
const requestsTable = base("Requests");
const offersTable = base("Offers");
const driversTable = base("Drivers");

export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneVerified: boolean;
  provider: AuthProvider;
  password?: string;
}

export interface Driver {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const records = await usersTable
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
    emailVerified: (record.get("emailVerified") as boolean) || false,
    firstName: (record.get("firstName") as string) || "",
    lastName: (record.get("lastName") as string) || "",
    phone: record.get("phone") as string | undefined,
    phoneVerified: (record.get("phoneVerified") as boolean) || false,
    provider: (record.get("provider") as AuthProvider) || "email",
    password: record.get("password") as string | undefined,
  };
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const record = await usersTable.find(id);
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
  } catch {
    return null;
  }
}

export interface CreateUserData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  provider?: AuthProvider;
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

  return {
    id: record.id,
    email: record.get("email") as string,
    emailVerified: (record.get("emailVerified") as boolean) || false,
    firstName: record.get("firstName") as string,
    lastName: record.get("lastName") as string,
    phone: record.get("phone") as string | undefined,
    phoneVerified: (record.get("phoneVerified") as boolean) || false,
    provider: (record.get("provider") as AuthProvider) || "email",
    password: record.get("password") as string | undefined,
  };
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Request status types
export type RequestStatus = 'draft' | 'published' | 'accepted' | 'paid' | 'completed' | 'cancelled';

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
  status: RequestStatus;
}

// Offer types
export interface OfferData {
  id: string;
  requestId: string;
  driverId: string;
  driverName?: string;
  driverEmail?: string;
  driverPhone?: string;
  price: number;
  message: string;
  status: number;
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
    User: [userId],
    userId,
    userEmail,
    from: data.from,
    to: data.to,
    date: data.date,
    time: data.time,
    adults: data.adults,
    children: data.children,
    options: JSON.stringify(data.options),
    status: 'published',
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
    status: (record.get("status") as RequestStatus) || 'published',
  };
}

export async function getRequestById(id: string): Promise<RequestData | null> {
  try {
    const record = await requestsTable.find(id);
    const userLinks = record.get("User") as string[] | undefined;

    return {
      id: record.id,
      userId: userLinks?.[0] || (record.get("userId") as string),
      userEmail: record.get("userEmail") as string,
      from: record.get("from") as string,
      to: record.get("to") as string,
      date: record.get("date") as string,
      time: record.get("time") as string,
      adults: record.get("adults") as number,
      children: record.get("children") as number,
      options: record.get("options") as string,
      status: (record.get("status") as RequestStatus) || 'published',
    };
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

  return records.map((record) => {
    const userLinks = record.get("User") as string[] | undefined;

    return {
      id: record.id,
      userId: userLinks?.[0] || (record.get("userId") as string),
      userEmail: record.get("userEmail") as string,
      from: record.get("from") as string,
      to: record.get("to") as string,
      date: record.get("date") as string,
      time: record.get("time") as string,
      adults: record.get("adults") as number,
      children: record.get("children") as number,
      options: record.get("options") as string,
      status: (record.get("status") as RequestStatus) || 'published',
    };
  });
}

export async function getRequestsByUserEmail(email: string): Promise<RequestData[]> {
  const records = await requestsTable
    .select({
      filterByFormula: `{userEmail} = '${email}'`,
    })
    .all();

  return records.map((record) => {
    const userLinks = record.get("User") as string[] | undefined;

    return {
      id: record.id,
      userId: userLinks?.[0] || (record.get("userId") as string),
      userEmail: record.get("userEmail") as string,
      from: record.get("from") as string,
      to: record.get("to") as string,
      date: record.get("date") as string,
      time: record.get("time") as string,
      adults: record.get("adults") as number,
      children: record.get("children") as number,
      options: record.get("options") as string,
      status: (record.get("status") as RequestStatus) || 'published',
    };
  });
}

// Offer functions for passenger app
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
      };
    })
  );

  // Sortuj od najnowszych (odwróć kolejność - nowsze rekordy mają wyższe ID)
  return offers.reverse();
}

export async function getOffersCountByRequestIds(requestIds: string[]): Promise<Record<string, number>> {
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
  // Update offer status to accepted
  await offersTable.update(offerId, { status: 2 });

  // Update request status to accepted
  await requestsTable.update(requestId, { status: 'accepted' });

  // Reject all other offers for this request
  const otherOffers = await offersTable
    .select({
      filterByFormula: `AND(FIND("${requestId}", ARRAYJOIN({Request})), NOT(RECORD_ID() = "${offerId}"))`,
    })
    .all();

  for (const offer of otherOffers) {
    await offersTable.update(offer.id, { status: 3 });
  }
}

export async function updateRequestStatus(requestId: string, status: RequestStatus): Promise<void> {
  await requestsTable.update(requestId, { status });
}

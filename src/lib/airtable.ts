import Airtable from "airtable";
import bcrypt from "bcryptjs";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

const usersTable = base(process.env.AIRTABLE_TABLE_NAME || "Users");
const requestsTable = base("Requests");
const offersTable = base("Offers");
const driversTable = base("Drivers");

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
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

  const record = await usersTable.create({
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
  status: number;
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
    status: 2,
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
    status: record.get("status") as number,
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
      status: (record.get("status") as number) || 2,
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
      status: (record.get("status") as number) || 2,
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
      status: (record.get("status") as number) || 2,
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
  const records = await offersTable
    .select({
      filterByFormula: `FIND("${requestId}", ARRAYJOIN({Request}))`,
    })
    .all();

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

  return offers;
}

export async function acceptOffer(offerId: string, requestId: string): Promise<void> {
  // Update offer status to accepted
  await offersTable.update(offerId, { status: 2 });

  // Update request status to accepted
  await requestsTable.update(requestId, { status: 4 });

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
